from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from .models import Region, FeaturePermission
from .validators import validate_phone_number, validate_role_assignment

User = get_user_model()


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name", "code"]


class FeaturePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeaturePermission
        fields = ["id", "code", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    region_code = serializers.CharField(source="region.code", read_only=True)
    pm_email = serializers.EmailField(source="pm.email", read_only=True)
    permission_codes = serializers.SerializerMethodField()
    feature_permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=FeaturePermission.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "region",
            "region_name",
            "region_code",
            "pm",
            "pm_email",
            "is_active",
            "date_joined",
            "password",
            "permission_codes",
            "feature_permissions",
        ]
        read_only_fields = ["id", "date_joined"]

    def validate_phone_number(self, value):
        """Validate phone number format."""
        validate_phone_number(value)
        return value

    def get_permission_codes(self, obj):
        return list(obj.feature_permissions.values_list("code", flat=True))

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        perms = validated_data.pop("feature_permissions", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password and password.strip():
            instance.set_password(password)
        instance.save()
        if perms is not None:
            instance.feature_permissions.set(perms)
        return instance


class UserCreateSerializer(serializers.ModelSerializer):
    """Create PM (by Super Admin) or Mentor Mother (by Super Admin or PM)."""

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "region",
            "pm",
            "feature_permissions",
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def validate_phone_number(self, value):
        """Validate phone number format."""
        validate_phone_number(value)
        return value

    def validate_role(self, value):
        """Validate role assignment based on current user."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validate_role_assignment(request.user, value)
        return value

    def create(self, validated_data):
        permissions = validated_data.pop("feature_permissions", [])
        password = validated_data.pop("password", None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        if permissions:
            user.feature_permissions.set(permissions)
        return user


class UserListSerializer(serializers.ModelSerializer):
    """Light list view: id, email, name, role, region, pm, permission_codes."""
    region_name = serializers.CharField(source="region.name", read_only=True)
    pm_email = serializers.EmailField(source="pm.email", read_only=True)
    permission_codes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "region",
            "region_name",
            "pm",
            "pm_email",
            "is_active",
            "date_joined",
            "permission_codes",
        ]

    def get_permission_codes(self, obj):
        return list(obj.feature_permissions.values_list("code", flat=True))


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile view and updates."""
    region_name = serializers.CharField(source="region.name", read_only=True)
    region_code = serializers.CharField(source="region.code", read_only=True)
    pm_email = serializers.EmailField(source="pm.email", read_only=True)
    permission_codes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "region",
            "region_name",
            "region_code",
            "pm",
            "pm_email",
            "is_active",
            "date_joined",
            "permission_codes",
        ]
        read_only_fields = ["id", "email", "role", "region", "pm", "is_active", "date_joined"]

    def get_permission_codes(self, obj):
        return list(obj.feature_permissions.values_list("code", flat=True))

    def validate_phone_number(self, value):
        """Validate phone number format."""
        if value:
            validate_phone_number(value)
        return value

    def update(self, instance, validated_data):
        """Update user profile information."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change functionality."""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        """Validate that the current password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        """Validate the new password using Django's password validation."""
        validate_password(value, self.context['request'].user)
        return value

    def validate(self, attrs):
        """Validate that new password and confirm password match."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New password and confirm password do not match."
            })
        return attrs

    def save(self):
        """Save the new password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

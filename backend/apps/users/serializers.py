from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Region, FeaturePermission

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

from rest_framework import serializers
from .models import ClientRegistration, ClientFollowUp, MCHReport, WeeklyPlan
from .validators import validate_age, validate_positive_integer, validate_weight, validate_muac, validate_sex


def get_created_by_email(obj):
    if getattr(obj, "created_by", None) and hasattr(obj.created_by, "email"):
        return obj.created_by.email
    return None


def get_created_by_name(obj):
    user = getattr(obj, "created_by", None)
    if not user:
        return None
    full_name = " ".join(
        [p for p in [getattr(user, "first_name", ""), getattr(user, "last_name", "")] if p]
    ).strip()
    return full_name or getattr(user, "email", None)


def get_created_by_region_fields(obj):
    user = getattr(obj, "created_by", None)
    region = getattr(user, "region", None) if user else None
    if not region:
        return None, None, None
    return str(region.id), region.name, region.code


class ClientRegistrationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_id = serializers.SerializerMethodField(read_only=True)
    created_by_region_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_code = serializers.SerializerMethodField(read_only=True)
    followup_count = serializers.SerializerMethodField(read_only=True)
    followup_created_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClientRegistration
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "folder_number"]

    def validate_age(self, value):
        """Validate client age."""
        validate_age(value)
        return value

    def validate_sex(self, value):
        """Validate sex field."""
        validate_sex(value)
        return value

    def validate_weight(self, value):
        """Validate weight."""
        validate_weight(value)
        return value

    def validate_muac(self, value):
        """Validate MUAC."""
        validate_muac(value)
        return value

    def validate_total_green_cases(self, value):
        """Validate total green cases."""
        validate_positive_integer(value)
        return value

    def validate_total_blue_cases(self, value):
        """Validate total blue cases."""
        validate_positive_integer(value)
        return value

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def get_created_by_name(self, obj):
        return get_created_by_name(obj)

    def get_created_by_region_id(self, obj):
        rid, _, _ = get_created_by_region_fields(obj)
        return rid

    def get_created_by_region_name(self, obj):
        _, name, _ = get_created_by_region_fields(obj)
        return name

    def get_created_by_region_code(self, obj):
        _, _, code = get_created_by_region_fields(obj)
        return code

    def get_followup_count(self, obj):
        qs = getattr(obj, "followups", None)
        if qs is None:
            return 0
        return len(qs.all())  # Use len() instead of count() since we have prefetched data

    def get_followup_created_by(self, obj):
        qs = getattr(obj, "followups", None)
        if qs is None:
            return []
        names = []
        for fu in qs.all():  # Now uses prefetched data, no additional queries
            name = get_created_by_name(fu) or get_created_by_email(fu)
            if name and name not in names:
                names.append(name)
        return names


class ClientFollowUpSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    created_by_role = serializers.SerializerMethodField(read_only=True)
    client_name = serializers.SerializerMethodField(read_only=True)
    client_folder_number = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClientFollowUp
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "date"]

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def get_created_by_name(self, obj):
        return get_created_by_name(obj)

    def get_created_by_role(self, obj):
        """Get the role of the user who created this follow-up"""
        user = getattr(obj, "created_by", None)
        if not user:
            return None
        return getattr(user, "role", None)

    def get_client_name(self, obj):
        """Get client name for display"""
        client = getattr(obj, "client", None)
        if not client:
            return None
        # ClientRegistration model has a 'name' field, not first_name/last_name
        return getattr(client, "name", "Unknown Client")

    def get_client_folder_number(self, obj):
        """Get client folder number for display"""
        client = getattr(obj, "client", None)
        if not client:
            return None
        return getattr(client, "folder_number", None)


class MCHReportSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_id = serializers.SerializerMethodField(read_only=True)
    created_by_region_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_code = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MCHReport
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def get_created_by_name(self, obj):
        return get_created_by_name(obj)

    def get_created_by_region_id(self, obj):
        rid, _, _ = get_created_by_region_fields(obj)
        return rid

    def get_created_by_region_name(self, obj):
        _, name, _ = get_created_by_region_fields(obj)
        return name

    def get_created_by_region_code(self, obj):
        _, _, code = get_created_by_region_fields(obj)
        return code


class WeeklyPlanSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_id = serializers.SerializerMethodField(read_only=True)
    created_by_region_name = serializers.SerializerMethodField(read_only=True)
    created_by_region_code = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WeeklyPlan
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def get_created_by_name(self, obj):
        return get_created_by_name(obj)

    def get_created_by_region_id(self, obj):
        rid, _, _ = get_created_by_region_fields(obj)
        return rid

    def get_created_by_region_name(self, obj):
        _, name, _ = get_created_by_region_fields(obj)
        return name

    def get_created_by_region_code(self, obj):
        _, _, code = get_created_by_region_fields(obj)
        return code

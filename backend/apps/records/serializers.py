from rest_framework import serializers
from .models import ClientRegistration, ClientFollowUp, MCHReport, WeeklyPlan


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
        return qs.count()

    def get_followup_created_by(self, obj):
        qs = getattr(obj, "followups", None)
        if qs is None:
            return []
        names = []
        for fu in qs.all():
            name = get_created_by_name(fu) or get_created_by_email(fu)
            if name and name not in names:
                names.append(name)
        return names

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["created_by_email"] = self.get_created_by_email(instance)
        data["created_by_name"] = self.get_created_by_name(instance)
        rid, rname, rcode = get_created_by_region_fields(instance)
        data["created_by_region_id"] = rid
        data["created_by_region_name"] = rname
        data["created_by_region_code"] = rcode
        data["followup_count"] = self.get_followup_count(instance)
        data["followup_created_by"] = self.get_followup_created_by(instance)
        return data


class ClientFollowUpSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClientFollowUp
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "date"]

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def get_created_by_name(self, obj):
        return get_created_by_name(obj)


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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["created_by_email"] = self.get_created_by_email(instance)
        data["created_by_name"] = self.get_created_by_name(instance)
        rid, rname, rcode = get_created_by_region_fields(instance)
        data["created_by_region_id"] = rid
        data["created_by_region_name"] = rname
        data["created_by_region_code"] = rcode
        return data


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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["created_by_email"] = self.get_created_by_email(instance)
        data["created_by_name"] = self.get_created_by_name(instance)
        rid, rname, rcode = get_created_by_region_fields(instance)
        data["created_by_region_id"] = rid
        data["created_by_region_name"] = rname
        data["created_by_region_code"] = rcode
        return data

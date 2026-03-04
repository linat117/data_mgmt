from rest_framework import serializers
from .models import ClientRegistration, MCHReport, WeeklyPlan


def get_created_by_email(obj):
    if getattr(obj, 'created_by', None) and hasattr(obj.created_by, 'email'):
        return obj.created_by.email
    return None


class ClientRegistrationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClientRegistration
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by_email'] = self.get_created_by_email(instance)
        return data


class MCHReportSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MCHReport
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by_email'] = self.get_created_by_email(instance)
        return data


class WeeklyPlanSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WeeklyPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_email(self, obj):
        return get_created_by_email(obj)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by_email'] = self.get_created_by_email(instance)
        return data

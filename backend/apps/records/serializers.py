from rest_framework import serializers
from .models import ClientRegistration, MCHReport, WeeklyPlan

class ClientRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientRegistration
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class MCHReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCHReport
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class WeeklyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

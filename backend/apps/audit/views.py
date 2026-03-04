from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'timestamp',
            'user_display',
            'action',
            'table_name',
            'record_id',
            'ip_address',
            'changes',
            'description',
        ]
        read_only_fields = [
            'id',
            'user_display',
            'action',
            'table_name',
            'record_id',
            'changes',
            'ip_address',
            'timestamp',
            'description',
        ]

    def get_user_display(self, obj):
        if obj.user:
            # Use email for now; can be extended to full name later
            return obj.user.email
        return "System"

    def get_description(self, obj):
        # Human-friendly sentence about what happened
        user_part = self.get_user_display(obj)

        # Map internal table name to readable label
        table_labels = {
            'records_clientregistration': 'client registration',
            'records_mchreport': 'MCH report',
            'records_weeklyplan': 'weekly plan',
        }
        table_label = table_labels.get(obj.table_name, obj.table_name.replace('_', ' '))

        action_labels = {
            'CREATE': 'created',
            'UPDATE': 'updated',
            'DELETE': 'deleted',
            'LOGIN': 'logged in',
        }
        action_text = action_labels.get(obj.action, obj.action.lower())

        if obj.action == 'LOGIN':
            base = f"{user_part} {action_text}"
        else:
            record_part = f" record {obj.record_id}" if obj.record_id else ""
            base = f"{user_part} {action_text}{record_part} in {table_label}"

        if obj.ip_address:
            return f"{base} from {obj.ip_address}"
        return base

from rest_framework import viewsets, permissions
from apps.users.views import IsAdminPermission


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminPermission]

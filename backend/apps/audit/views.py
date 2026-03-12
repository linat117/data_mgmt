from rest_framework import serializers
from .models import AuditLog
from apps.records.models import ClientRegistration, MCHReport, WeeklyPlan


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
        """
        Prefer a human name; fall back to email or 'System'.
        """
        user = getattr(obj, "user", None)
        if not user:
            return "System"
        first = (getattr(user, "first_name", "") or "").strip()
        last = (getattr(user, "last_name", "") or "").strip()
        full = " ".join(p for p in [first, last] if p)
        return full or getattr(user, "email", "") or "System"

    def _get_table_label(self, obj):
        table_labels = {
            ClientRegistration._meta.db_table: "client registration",
            MCHReport._meta.db_table: "MCH report",
            WeeklyPlan._meta.db_table: "weekly plan",
        }
        return table_labels.get(obj.table_name, obj.table_name.replace("_", " "))

    def _get_record_human_name(self, obj):
        """
        Try to resolve a human-friendly record name for known tables.
        """
        if not obj.record_id:
            return None

        if obj.table_name == ClientRegistration._meta.db_table:
            try:
                rec = ClientRegistration.objects.get(pk=obj.record_id)
            except ClientRegistration.DoesNotExist:
                return None
            base = rec.name or f"client {rec.pk}"
            if rec.folder_number:
                return f"{base} ({rec.folder_number})"
            return base

        if obj.table_name == MCHReport._meta.db_table:
            try:
                rec = MCHReport.objects.get(pk=obj.record_id)
            except MCHReport.DoesNotExist:
                return None
            return f"MCH report for {rec.mentor_mother_name} on {rec.date}"

        if obj.table_name == WeeklyPlan._meta.db_table:
            try:
                rec = WeeklyPlan.objects.get(pk=obj.record_id)
            except WeeklyPlan.DoesNotExist:
                return None
            return f"weekly plan for {rec.mentor_mother_name} on {rec.date} ({rec.day_of_week})"

        return None

    def get_description(self, obj):
        # Human-friendly sentence about what happened
        user_part = self.get_user_display(obj)
        table_label = self._get_table_label(obj)

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
            record_name = self._get_record_human_name(obj)
            if record_name:
                base = f"{user_part} {action_text} {record_name} in {table_label}"
            else:
                record_part = f" record {obj.record_id}" if obj.record_id else ""
                base = f"{user_part} {action_text}{record_part} in {table_label}"

        # Additional context instead of raw IP: show user role / region when available.
        user = getattr(obj, "user", None)
        extra_bits = []
        if user:
            role = getattr(user, "role", None)
            if role:
                extra_bits.append(role)
            region = getattr(user, "region", None)
            if region:
                extra_bits.append(f"region {region.name}")

        if extra_bits:
            return f"{base} ({', '.join(extra_bits)})"
        return base

from rest_framework import viewsets, permissions
from apps.users.views import IsSuperAdminPermission


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminPermission]

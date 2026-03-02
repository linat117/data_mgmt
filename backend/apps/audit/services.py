from apps.audit.models import AuditLog

def log_audit_action(user, action, instance, request=None, changes=None):
    ip_address = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
            
    AuditLog.objects.create(
        user=user,
        action=action,
        table_name=instance._meta.db_table,
        record_id=str(instance.pk),
        changes=changes,
        ip_address=ip_address
    )

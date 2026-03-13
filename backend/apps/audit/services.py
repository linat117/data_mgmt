from apps.audit.models import AuditLog

def get_record_description(instance):
    """Get human-readable description of the record being audited"""
    try:
        if hasattr(instance, 'name'):
            return f"Client: {instance.name}"
        elif hasattr(instance, 'mentor_mother_name'):
            return f"Client: {instance.mentor_mother_name}"
        elif hasattr(instance, 'date'):
            return f"MCH Report for {instance.mentor_mother_name} on {instance.date}"
        elif hasattr(instance, 'client_name'):
            return f"Weekly Plan for {instance.client_name} on {instance.date}"
        elif hasattr(instance, 'client'):
            return f"Follow-up for {instance.client.name if instance.client else 'Unknown'}"
        else:
            return f"{instance._meta.verbose_name} {instance.pk}"
    except:
        return f"{instance._meta.verbose_name} {instance.pk}"

def log_audit_action(user, action, instance, request=None, changes=None):
    ip_address = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
    
    # Get human-readable record description
    record_desc = get_record_description(instance)
    
    # Prepare meaningful changes description
    changes_desc = None
    if changes:
        if action == 'CREATE':
            changes_desc = f"Created new {record_desc}"
        elif action == 'UPDATE':
            changes_desc = f"Updated {record_desc}"
        elif action == 'DELETE':
            changes_desc = f"Deleted {record_desc}"
    
    AuditLog.objects.create(
        user=user,
        action=action,
        table_name=instance._meta.db_table,
        record_id=str(instance.pk),
        changes=changes_desc,
        ip_address=ip_address
    )

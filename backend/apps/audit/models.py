import uuid
from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    table_name = models.CharField(max_length=100)
    record_id = models.CharField(max_length=255, null=True, blank=True)
    changes = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_part = ""
        if self.user:
            first = (getattr(self.user, "first_name", "") or "").strip()
            last = (getattr(self.user, "last_name", "") or "").strip()
            user_part = " ".join(p for p in [first, last] if p) or self.user.email
        else:
            user_part = "System"
        
        action_desc = {
            'CREATE': 'created',
            'UPDATE': 'updated', 
            'DELETE': 'deleted',
            'LOGIN': 'logged in'
        }.get(self.action, 'performed action on')
        
        record_part = ""
        if self.record_id and self.table_name:
            if 'client' in self.table_name:
                record_part = f"record {self.record_id}"
            else:
                record_part = f"record {self.record_id}"
        
        return f"{user_part} {action_desc} {record_part} at {self.timestamp.strftime('%Y-%m-%d %I:%M %p')}"

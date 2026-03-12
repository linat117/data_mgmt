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
        if self.user:
            first = (getattr(self.user, "first_name", "") or "").strip()
            last = (getattr(self.user, "last_name", "") or "").strip()
            full = " ".join(p for p in [first, last] if p) or self.user.email
        else:
            full = "System"
        return f"{full} - {self.action} - {self.table_name} at {self.timestamp}"

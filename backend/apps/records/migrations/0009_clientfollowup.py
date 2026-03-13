from django.db import migrations, models
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ("records", "0008_add_pregnancies_json"),
    ]

    operations = [
        migrations.CreateModel(
            name="ClientFollowUp",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("date", models.DateField(auto_now_add=True)),
                ("notes", models.TextField(blank=True)),
                ("data", models.JSONField(default=dict, blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("client", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="followups", to="records.clientregistration")),
                ("created_by", models.ForeignKey(null=True, on_delete=models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]


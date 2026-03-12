from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("records", "0007_add_third_pregnancy_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="clientregistration",
            name="pregnancies",
            field=models.JSONField(default=list, blank=True),
        ),
    ]


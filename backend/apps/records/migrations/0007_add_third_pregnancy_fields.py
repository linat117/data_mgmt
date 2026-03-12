from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("records", "0006_add_dummy_records_for_existing_users"),
    ]

    operations = [
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_preg_date",
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_pregnancy",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_breastfeeding",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_antenatal",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_postnatal",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_immunization",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_delivery_date",
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="clientregistration",
            name="spss_third_number_children_after",
            field=models.IntegerField(null=True, blank=True),
        ),
    ]


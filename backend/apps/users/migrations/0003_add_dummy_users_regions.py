from django.db import migrations


def create_dummy_users_and_regions(apps, schema_editor):
    Region = apps.get_model("users", "Region")
    User = apps.get_model("users", "User")

    # Create a couple of regions if they don't already exist
    aa_region, _ = Region.objects.get_or_create(
        code="AA",
        defaults={"name": "Addis Ababa"},
    )
    or_region, _ = Region.objects.get_or_create(
        code="OR",
        defaults={"name": "Oromia"},
    )

    # Helper to create a user (no password logic here, since historical
    # migration models don't expose set_password).
    def ensure_user(email, role, region=None, pm=None, first_name="", last_name=""):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "role": role,
                "region": region,
                "pm": pm,
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True,
            },
        )
        return user

    # Super admin
    admin = ensure_user(
        email="admin@datam.local",
        role="SUPER_ADMIN",
        region=None,
        first_name="Global",
        last_name="Admin",
    )

    # Project Manager for Addis Ababa
    pm_aa = ensure_user(
        email="pm.aa@datam.local",
        role="PM",
        region=aa_region,
        first_name="Addis",
        last_name="Manager",
    )

    # Project Manager for Oromia
    pm_or = ensure_user(
        email="pm.or@datam.local",
        role="PM",
        region=or_region,
        first_name="Oromia",
        last_name="Manager",
    )

    # Mentor Mothers assigned to PMs
    ensure_user(
        email="mm.aa1@datam.local",
        role="MENTOR_MOTHER",
        region=aa_region,
        pm=pm_aa,
        first_name="Alemnesh",
        last_name="Tadesse",
    )
    ensure_user(
        email="mm.aa2@datam.local",
        role="MENTOR_MOTHER",
        region=aa_region,
        pm=pm_aa,
        first_name="Meskerem",
        last_name="Bekele",
    )
    ensure_user(
        email="mm.or1@datam.local",
        role="MENTOR_MOTHER",
        region=or_region,
        pm=pm_or,
        first_name="Hanna",
        last_name="Hailemariam",
    )


def delete_dummy_users_and_regions(apps, schema_editor):
    Region = apps.get_model("users", "Region")
    User = apps.get_model("users", "User")

    User.objects.filter(
        email__in=[
            "admin@datam.local",
            "pm.aa@datam.local",
            "pm.or@datam.local",
            "mm.aa1@datam.local",
            "mm.aa2@datam.local",
            "mm.or1@datam.local",
        ]
    ).delete()

    Region.objects.filter(code__in=["AA", "OR"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_add_region_permissions_three_roles"),
    ]

    operations = [
        migrations.RunPython(
            create_dummy_users_and_regions,
            delete_dummy_users_and_regions,
        ),
    ]


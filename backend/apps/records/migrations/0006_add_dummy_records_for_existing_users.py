from django.db import migrations
import datetime


def create_dummy_for_existing_users(apps, schema_editor):
    User = apps.get_model("users", "User")
    ClientRegistration = apps.get_model("records", "ClientRegistration")
    MCHReport = apps.get_model("records", "MCHReport")
    WeeklyPlan = apps.get_model("records", "WeeklyPlan")

    today = datetime.date.today()

    def full_name(u):
        name = " ".join([p for p in [u.first_name, u.last_name] if p]).strip()
        return name or u.email

    # Create client registrations for each Mentor Mother
    for mm in User.objects.filter(role="MENTOR_MOTHER", is_active=True):
        mentor_name = full_name(mm)

        # First dummy client
        ClientRegistration.objects.create(
            mentor_mother_name=mentor_name,
            date=today - datetime.timedelta(days=2),
            total_green_cases=2,
            total_blue_cases=1,
            name=f"{mentor_name} Client A",
            age=24,
            sex="F",
            folder_number=f"DEMO-{mm.id.hex[:6]}-A",
            address="Demo address for training",
            identified_problem="Demo: nutrition counseling required.",
            counseling_given="Demo: explained basic nutrition and follow-up.",
            created_by=mm,
        )

        # Second dummy client
        ClientRegistration.objects.create(
            mentor_mother_name=mentor_name,
            date=today - datetime.timedelta(days=1),
            total_green_cases=1,
            total_blue_cases=0,
            name=f"{mentor_name} Client B",
            age=28,
            sex="F",
            folder_number=f"DEMO-{mm.id.hex[:6]}-B",
            address="Demo address for training",
            identified_problem="Demo: breastfeeding support.",
            counseling_given="Demo: discussed exclusive breastfeeding.",
            created_by=mm,
        )

        # One weekly plan for this MM
        WeeklyPlan.objects.create(
            mentor_mother_name=mentor_name,
            date=today,
            district=mm.region.name if getattr(mm, "region", None) else "Demo District",
            day_of_week="Wixata",
            client_name=f"{mentor_name} Client A",
            content="Demo: household visit and counseling.",
            objective="Demo training data",
            observation="Demo observation",
            created_by=mm,
        )

    # Create some MCH reports for each Project Manager based on their name
    for pm in User.objects.filter(role="PM", is_active=True):
        mentor_name = full_name(pm)
        MCHReport.objects.create(
            mentor_mother_name=mentor_name,
            date=today - datetime.timedelta(days=1),
            total_green=3,
            total_blue=1,
            metrics={},
            created_by=pm,
        )


def delete_dummy_for_existing_users(apps, schema_editor):
    User = apps.get_model("users", "User")
    ClientRegistration = apps.get_model("records", "ClientRegistration")
    MCHReport = apps.get_model("records", "MCHReport")
    WeeklyPlan = apps.get_model("records", "WeeklyPlan")

    # Clean up records we created based on the DEMO folder prefix
    ClientRegistration.objects.filter(folder_number__startswith="DEMO-").delete()

    # Remove weekly plans and MCH reports that look like demo content
    WeeklyPlan.objects.filter(content__startswith="Demo:").delete()

    pm_names = [
        " ".join([p for p in [u.first_name, u.last_name] if p]).strip() or u.email
        for u in User.objects.filter(role="PM")
    ]
    if pm_names:
        MCHReport.objects.filter(mentor_mother_name__in=pm_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_add_region_permissions_three_roles"),
        ("records", "0005_add_dummy_records_with_users"),
    ]

    operations = [
        migrations.RunPython(
            create_dummy_for_existing_users,
            delete_dummy_for_existing_users,
        ),
    ]


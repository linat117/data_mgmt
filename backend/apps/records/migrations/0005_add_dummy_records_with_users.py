from django.db import migrations
import datetime


def create_dummy_records(apps, schema_editor):
    User = apps.get_model("users", "User")
    ClientRegistration = apps.get_model("records", "ClientRegistration")
    MCHReport = apps.get_model("records", "MCHReport")
    WeeklyPlan = apps.get_model("records", "WeeklyPlan")

    def get_user(email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    admin = get_user("admin@datam.local")
    pm_aa = get_user("pm.aa@datam.local")
    pm_or = get_user("pm.or@datam.local")
    mm_aa1 = get_user("mm.aa1@datam.local")
    mm_aa2 = get_user("mm.aa2@datam.local")
    mm_or1 = get_user("mm.or1@datam.local")

    # Helper to create a client registration with minimal required fields
    def add_client(creator, mentor_name, name, age, sex, address, date, folder, green, blue):
        if creator is None:
            return
        ClientRegistration.objects.create(
            mentor_mother_name=mentor_name,
            date=date,
            total_green_cases=green,
            total_blue_cases=blue,
            name=name,
            age=age,
            sex=sex,
            folder_number=folder,
            address=address,
            identified_problem="Dummy identified problem for demo.",
            counseling_given="Dummy counseling given for demo.",
            created_by=creator,
        )

    base_date = datetime.date(2026, 3, 1)

    # Addis Ababa (AA) – records by PM and Mentor Mothers
    add_client(
        creator=pm_aa,
        mentor_name="Alemnesh Tadesse",
        name="Abebe Kebede",
        age=28,
        sex="M",
        address="Bole, Addis Ababa",
        date=base_date,
        folder="AA_001",
        green=3,
        blue=1,
    )
    add_client(
        creator=mm_aa1,
        mentor_name="Alemnesh Tadesse",
        name="Hirut Tesfaye",
        age=24,
        sex="F",
        address="Piassa, Addis Ababa",
        date=base_date + datetime.timedelta(days=1),
        folder="AA_002",
        green=2,
        blue=0,
    )
    add_client(
        creator=mm_aa2,
        mentor_name="Meskerem Bekele",
        name="Rahel Solomon",
        age=21,
        sex="F",
        address="Kirkos, Addis Ababa",
        date=base_date + datetime.timedelta(days=2),
        folder="AA_003",
        green=1,
        blue=1,
    )

    # Oromia (OR) – records by PM and Mentor Mother
    add_client(
        creator=pm_or,
        mentor_name="Hanna Hailemariam",
        name="Yared Fikre",
        age=30,
        sex="M",
        address="Adama, Oromia",
        date=base_date,
        folder="OR_001",
        green=5,
        blue=0,
    )
    add_client(
        creator=mm_or1,
        mentor_name="Hanna Hailemariam",
        name="Getachew Alemu",
        age=32,
        sex="M",
        address="Hawassa, Sidama",
        date=base_date + datetime.timedelta(days=1),
        folder="OR_002",
        green=4,
        blue=2,
    )

    # Some MCH reports tied to the same mentor mothers / dates
    def add_mch(creator, mentor_name, date, green, blue):
        if creator is None:
            return
        MCHReport.objects.create(
            mentor_mother_name=mentor_name,
            date=date,
            total_green=green,
            total_blue=blue,
            metrics={},
            created_by=creator,
        )

    add_mch(pm_aa, "Alemnesh Tadesse", base_date, 3, 1)
    add_mch(mm_aa1, "Alemnesh Tadesse", base_date + datetime.timedelta(days=1), 2, 0)
    add_mch(pm_or, "Hanna Hailemariam", base_date, 5, 0)

    # Weekly plans per region
    def add_plan(creator, mentor_name, district, day, client_name, content):
        if creator is None:
            return
        WeeklyPlan.objects.create(
            mentor_mother_name=mentor_name,
            date=base_date,
            district=district,
            day_of_week=day,
            client_name=client_name,
            content=content,
            objective="Demo objective",
            observation="Demo observation",
            created_by=creator,
        )

    add_plan(pm_aa, "Alemnesh Tadesse", "Addis Ababa", "Wixata", "Abebe Kebede", "Household visit and counseling.")
    add_plan(pm_or, "Hanna Hailemariam", "Adama", "Kibxata", "Yared Fikre", "Clinic follow-up and record review.")


def delete_dummy_records(apps, schema_editor):
    ClientRegistration = apps.get_model("records", "ClientRegistration")
    MCHReport = apps.get_model("records", "MCHReport")
    WeeklyPlan = apps.get_model("records", "WeeklyPlan")

    ClientRegistration.objects.filter(folder_number__in=["AA_001", "AA_002", "AA_003", "OR_001", "OR_002"]).delete()
    MCHReport.objects.filter(
        mentor_mother_name__in=["Alemnesh Tadesse", "Hanna Hailemariam"]
    ).delete()
    WeeklyPlan.objects.filter(
        district__in=["Addis Ababa", "Adama"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_add_dummy_users_regions"),
        ("records", "0004_add_dummy_clientregistration"),
    ]

    operations = [
        migrations.RunPython(create_dummy_records, delete_dummy_records),
    ]


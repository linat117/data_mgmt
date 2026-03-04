from django.db import migrations
import datetime


def create_dummy_client_registrations(apps, schema_editor):
    ClientRegistration = apps.get_model('records', 'ClientRegistration')

    dummy_rows = [
        {
            "mentor_mother_name": "Alemnesh Tadesse",
            "date": datetime.date(2026, 3, 1),
            "total_green_cases": 3,
            "total_blue_cases": 1,
            "name": "Abebe Kebede",
            "age": 28,
            "sex": "M",
            "folder_number": "DUMMY-001",
            "address": "Bole, Addis Ababa, Ethiopia",
            "identified_problem": "Nutrition counseling needed for underweight child.",
            "counseling_given": "Provided basic nutrition counseling and follow-up schedule.",
        },
        {
            "mentor_mother_name": "Meskerem Bekele",
            "date": datetime.date(2026, 3, 2),
            "total_green_cases": 2,
            "total_blue_cases": 0,
            "name": "Hirut Tesfaye",
            "age": 24,
            "sex": "F",
            "folder_number": "DUMMY-002",
            "address": "Piassa, Addis Ababa, Ethiopia",
            "identified_problem": "Breastfeeding support required for first-time mother.",
            "counseling_given": "Discussed exclusive breastfeeding and positioning techniques.",
        },
        {
            "mentor_mother_name": "Selamawit Demissie",
            "date": datetime.date(2026, 3, 3),
            "total_green_cases": 4,
            "total_blue_cases": 2,
            "name": "Getachew Alemu",
            "age": 32,
            "sex": "M",
            "folder_number": "DUMMY-003",
            "address": "Hawassa, Sidama, Ethiopia",
            "identified_problem": "Poor dietary diversity in household meals.",
            "counseling_given": "Provided education on locally available diverse foods.",
        },
        {
            "mentor_mother_name": "Martha Wolde",
            "date": datetime.date(2026, 3, 4),
            "total_green_cases": 1,
            "total_blue_cases": 1,
            "name": "Rahel Solomon",
            "age": 21,
            "sex": "F",
            "folder_number": "DUMMY-004",
            "address": "Bahir Dar, Amhara, Ethiopia",
            "identified_problem": "Lack of awareness on antenatal care visits.",
            "counseling_given": "Explained importance and schedule of ANC visits.",
        },
        {
            "mentor_mother_name": "Hanna Hailemariam",
            "date": datetime.date(2026, 3, 5),
            "total_green_cases": 5,
            "total_blue_cases": 0,
            "name": "Yared Fikre",
            "age": 30,
            "sex": "M",
            "folder_number": "DUMMY-005",
            "address": "Adama, Oromia, Ethiopia",
            "identified_problem": "Child not gaining weight as expected.",
            "counseling_given": "Reviewed feeding frequency and referred for further assessment.",
        },
    ]

    for row in dummy_rows:
        ClientRegistration.objects.create(**row)


def delete_dummy_client_registrations(apps, schema_editor):
    ClientRegistration = apps.get_model('records', 'ClientRegistration')
    ClientRegistration.objects.filter(folder_number__in=[
        "DUMMY-001",
        "DUMMY-002",
        "DUMMY-003",
        "DUMMY-004",
        "DUMMY-005",
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('records', '0003_clientregistration_spss_breastfeeding_status_and_more'),
    ]

    operations = [
        migrations.RunPython(
            create_dummy_client_registrations,
            delete_dummy_client_registrations,
        ),
    ]


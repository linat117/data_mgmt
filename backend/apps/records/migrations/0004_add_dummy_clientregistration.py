from django.db import migrations
import datetime


def create_dummy_client_registrations(apps, schema_editor):
    ClientRegistration = apps.get_model('records', 'ClientRegistration')

    rows = [
        {
            "mentor_mother_name": "Sara Johnson",
            "date": datetime.date(2026, 3, 1),
            "total_green_cases": 3,
            "total_blue_cases": 1,
            "name": "Michael Brown",
            "age": 28,
            "sex": "M",
            "folder_number": "CR-0001",
            "address": "12 Oak Street, Springfield",
            "identified_problem": "Nutrition counseling needed for underweight child.",
            "counseling_given": "Provided basic nutrition counseling and follow-up schedule.",
        },
        {
            "mentor_mother_name": "Emily Davis",
            "date": datetime.date(2026, 3, 2),
            "total_green_cases": 2,
            "total_blue_cases": 0,
            "name": "Olivia Wilson",
            "age": 24,
            "sex": "F",
            "folder_number": "CR-0002",
            "address": "45 Market Road, Lakeside",
            "identified_problem": "Breastfeeding support required for first-time mother.",
            "counseling_given": "Discussed exclusive breastfeeding and positioning techniques.",
        },
        {
            "mentor_mother_name": "Linda Martinez",
            "date": datetime.date(2026, 3, 3),
            "total_green_cases": 4,
            "total_blue_cases": 2,
            "name": "David Thompson",
            "age": 32,
            "sex": "M",
            "folder_number": "CR-0003",
            "address": "88 Hilltop Avenue, Riverside",
            "identified_problem": "Poor dietary diversity in household meals.",
            "counseling_given": "Provided education on locally available diverse foods.",
        },
        {
            "mentor_mother_name": "Patricia Miller",
            "date": datetime.date(2026, 3, 4),
            "total_green_cases": 1,
            "total_blue_cases": 1,
            "name": "Sophia Anderson",
            "age": 21,
            "sex": "F",
            "folder_number": "CR-0004",
            "address": "7 Garden Lane, Fairview",
            "identified_problem": "Lack of awareness on antenatal care visits.",
            "counseling_given": "Explained importance and schedule of ANC visits.",
        },
        {
            "mentor_mother_name": "Jessica Taylor",
            "date": datetime.date(2026, 3, 5),
            "total_green_cases": 5,
            "total_blue_cases": 0,
            "name": "Daniel Harris",
            "age": 30,
            "sex": "M",
            "folder_number": "CR-0005",
            "address": "101 Sunset Boulevard, Brookfield",
            "identified_problem": "Child not gaining weight as expected.",
            "counseling_given": "Reviewed feeding frequency and referred for further assessment.",
        },
    ]

    for row in rows:
        ClientRegistration.objects.create(**row)


def delete_dummy_client_registrations(apps, schema_editor):
    ClientRegistration = apps.get_model('records', 'ClientRegistration')
    ClientRegistration.objects.filter(folder_number__in=[
        "CR-0001",
        "CR-0002",
        "CR-0003",
        "CR-0004",
        "CR-0005",
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


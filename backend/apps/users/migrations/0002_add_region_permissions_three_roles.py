# Generated manually for Region, FeaturePermission, and User role/region/pm/permissions

import uuid
from django.db import migrations, models
import django.db.models.deletion


def migrate_roles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    # Map old roles to new: ADMIN -> SUPER_ADMIN, DATA_EXPERT -> MENTOR_MOTHER
    User.objects.filter(role='ADMIN').update(role='SUPER_ADMIN')
    User.objects.filter(role='DATA_EXPERT').update(role='MENTOR_MOTHER')


def reverse_roles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(role='SUPER_ADMIN').update(role='ADMIN')
    User.objects.filter(role='MENTOR_MOTHER').update(role='DATA_EXPERT')


def create_default_permissions(apps, schema_editor):
    FeaturePermission = apps.get_model('users', 'FeaturePermission')
    defaults = [
        ('dashboard.view', 'View Dashboard', 'Access dashboard and analytics'),
        ('dashboard.export', 'Export Dashboard', 'Export dashboard data'),
        ('records.view', 'View Data Records', 'View client/MCH/plans records'),
        ('records.create', 'Create Data Records', 'Create new records'),
        ('records.edit', 'Edit Data Records', 'Edit existing records'),
        ('records.delete', 'Delete Data Records', 'Delete records'),
        ('users.view', 'View Users', 'View user list'),
        ('users.create', 'Create Users', 'Create PM or Mentor Mother'),
        ('users.edit', 'Edit Users', 'Edit user details'),
        ('users.delete', 'Delete Users', 'Delete users'),
        ('audit.view', 'View Audit Logs', 'View audit log'),
    ]
    for code, name, desc in defaults:
        FeaturePermission.objects.get_or_create(code=code, defaults={'name': name, 'description': desc or ''})


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('code', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='FeaturePermission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(max_length=100, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.RunPython(migrate_roles, reverse_roles),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('SUPER_ADMIN', 'Super Admin'),
                    ('PM', 'Project Manager'),
                    ('MENTOR_MOTHER', 'Mentor Mother'),
                ],
                default='MENTOR_MOTHER',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='user',
            name='region',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='users',
                to='users.region',
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='pm',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='mentor_mothers',
                to='users.user',
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='feature_permissions',
            field=models.ManyToManyField(blank=True, related_name='users', to='users.featurepermission'),
        ),
        migrations.RunPython(create_default_permissions, migrations.RunPython.noop),
    ]

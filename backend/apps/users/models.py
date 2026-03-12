from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid


class Region(models.Model):
    """
    Geographic/administrative region to which PMs and Mentor Mothers belong.
    Managed independently so that it can be reused as a dropdown.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class FeaturePermission(models.Model):
    """
    Fine-grained feature-level permission (e.g. 'records.view', 'records.edit').
    Users can be granted any combination of these.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.code


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            # Allow creation without an initial password; it can be set on first login/reset.
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "SUPER_ADMIN")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user with three high-level roles:
    - SUPER_ADMIN: system-wide control, global analytics, manages PMs and MMs
    - PM: manages Mentor Mothers within a specific region
    - MENTOR_MOTHER: data entry and limited reporting
    """

    ROLE_SUPER_ADMIN = "SUPER_ADMIN"
    ROLE_PM = "PM"
    ROLE_MENTOR_MOTHER = "MENTOR_MOTHER"

    ROLE_CHOICES = (
        (ROLE_SUPER_ADMIN, "Super Admin"),
        (ROLE_PM, "Project Manager"),
        (ROLE_MENTOR_MOTHER, "Mentor Mother"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)

    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default=ROLE_MENTOR_MOTHER)

    # Contact and assignment metadata
    phone_number = models.CharField(max_length=50, blank=True)
    region = models.ForeignKey(
        Region, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )

    # For Mentor Mothers: which PM they belong to. For PMs/Super Admins this can be null.
    pm = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mentor_mothers",
    )

    # Fine-grained feature permissions assigned directly to this user.
    feature_permissions = models.ManyToManyField(
        FeaturePermission,
        blank=True,
        related_name="users",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

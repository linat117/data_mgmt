from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Region, FeaturePermission


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("name", "code")


@admin.register(FeaturePermission)
class FeaturePermissionAdmin(admin.ModelAdmin):
    list_display = ("code", "name")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "region", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = ("feature_permissions",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Role & scope", {"fields": ("role", "region", "pm")}),
        ("Permissions", {"fields": ("feature_permissions",)}),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Role & scope", {"fields": ("role", "region", "pm")}),
    )

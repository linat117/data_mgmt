from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from .models import Region, FeaturePermission
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserListSerializer,
    RegionSerializer,
    FeaturePermissionSerializer,
)

User = get_user_model()


class IsSuperAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == User.ROLE_SUPER_ADMIN
        )


class IsSuperAdminOrPMPermission(permissions.BasePermission):
    """Super Admin can do everything; PM can manage their region and their MMs."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (User.ROLE_SUPER_ADMIN, User.ROLE_PM)


class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all().order_by("name")
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminPermission]


class FeaturePermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FeaturePermission.objects.all().order_by("code")
    serializer_class = FeaturePermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSuperAdminOrPMPermission]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action == "list":
            return UserListSerializer
        return UserSerializer

    def get_queryset(self):
        from django.db import models

        user = self.request.user
        if user.role == User.ROLE_SUPER_ADMIN:
            return User.objects.all().select_related("region", "pm").prefetch_related("feature_permissions")
        if user.role == User.ROLE_PM:
            return User.objects.filter(
                models.Q(pk=user.pk) | models.Q(pm=user)
            ).select_related("region", "pm").prefetch_related("feature_permissions")
        return User.objects.none()

    def perform_create(self, serializer):
        data = serializer.validated_data
        creator = self.request.user
        role = data.get("role")

        if creator.role == User.ROLE_PM:
            if role != User.ROLE_MENTOR_MOTHER:
                raise ValidationError({"role": "PM can only create Mentor Mothers."})
            # Region comes from PM
            data["region"] = creator.region
            data["pm"] = creator
        elif creator.role == User.ROLE_SUPER_ADMIN:
            if role == User.ROLE_MENTOR_MOTHER and data.get("pm"):
                # Region is derived from PM
                data["region"] = data["pm"].region
            # else PM gets region from input; Super Admin sets it
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if str(instance.id) == str(request.user.id):
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if str(instance.id) == str(request.user.id) and request.data.get("is_active") is False:
            return Response(
                {"detail": "You cannot disable your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().partial_update(request, *args, **kwargs)

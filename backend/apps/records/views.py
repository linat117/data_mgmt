from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from itertools import chain
from django.contrib.auth import get_user_model
from django.db import models

from .models import ClientRegistration, ClientFollowUp, MCHReport, WeeklyPlan
from .serializers import (
    ClientRegistrationSerializer,
    ClientFollowUpSerializer,
    MCHReportSerializer,
    WeeklyPlanSerializer,
)
from apps.audit.services import log_audit_action

User = get_user_model()


def records_queryset_for_user(model_class, user):
    """Return base queryset for ClientRegistration/MCHReport/WeeklyPlan scoped to user's role."""
    if user.role == User.ROLE_SUPER_ADMIN:
        return model_class.objects.all()
    if user.role == User.ROLE_PM:
        mm_ids = list(User.objects.filter(pm=user).values_list("id", flat=True))
        allowed_ids = list(mm_ids) + [user.id]
        return model_class.objects.filter(created_by_id__in=allowed_ids)
    return model_class.objects.filter(created_by=user)


def user_can_access_record(user, obj):
    if obj.created_by_id is None:
        return user.role == User.ROLE_SUPER_ADMIN
    if user.role == User.ROLE_SUPER_ADMIN:
        return True
    if user.role == User.ROLE_PM:
        return obj.created_by_id == user.id or obj.created_by_id in User.objects.filter(pm=user).values_list("id", flat=True)
    return obj.created_by_id == user.id


class IsOwnerOrAdminPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return user_can_access_record(request.user, obj)


class BaseMCHViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminPermission]

    def get_queryset(self):
        qs = records_queryset_for_user(self.queryset.model, self.request.user)
        return qs.order_by("-created_at").select_related("created_by", "created_by__region")

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        log_audit_action(self.request.user, "CREATE", instance, self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_audit_action(self.request.user, "UPDATE", instance, self.request)

    def perform_destroy(self, instance):
        log_audit_action(self.request.user, "DELETE", instance, self.request)
        instance.delete()


class ClientRegistrationViewSet(BaseMCHViewSet):
    queryset = ClientRegistration.objects.all()
    serializer_class = ClientRegistrationSerializer

    def get_queryset(self):
        qs = records_queryset_for_user(self.queryset.model, self.request.user)
        return qs.order_by("-created_at").select_related("created_by", "created_by__region").prefetch_related(
            "followups__created_by", "followups__created_by__region"
        )

    def perform_create(self, serializer):
        """
        Automatically assign a region-based, gap-free folder_number on create.

        Format: REGIONCODE_001, REGIONCODE_002, ...
        The smallest available number for that region is used, so if one
        registration is deleted, the freed number will be reused.

        Region resolution:
        - If user.region is set, use that.
        - Else if user.pm.region is set (Mentor Mother whose PM has a region), use that.
        - Otherwise fall back to "GEN".
        """
        user = self.request.user
        instance = serializer.save(created_by=user)

        region = getattr(user, "region", None)
        if region is None and getattr(user, "pm", None):
            region = getattr(user.pm, "region", None)

        region_code = getattr(region, "code", None) or "GEN"
        prefix = f"{region_code}_"

        # Use a simpler approach - get existing folder numbers and process in Python
        if region is not None:
            user_ids = list(
                User.objects.filter(models.Q(region=region) | models.Q(pm__region=region)).values_list(
                    "id", flat=True
                )
            )
            existing_numbers = ClientRegistration.objects.filter(
                created_by_id__in=user_ids,
                folder_number__startswith=prefix
            ).values_list('folder_number', flat=True)
        else:
            existing_numbers = ClientRegistration.objects.filter(
                folder_number__startswith=prefix
            ).values_list('folder_number', flat=True)

        # Extract numeric parts and find max
        max_num = 0
        for fn in existing_numbers:
            if fn and fn.startswith(prefix):
                try:
                    num_part = int(fn.split('_')[-1])
                    if num_part > max_num:
                        max_num = num_part
                except (ValueError, TypeError):
                    continue

        instance.folder_number = f"{prefix}{max_num + 1:03d}"
        instance.save(update_fields=["folder_number"])
        log_audit_action(self.request.user, "CREATE", instance, self.request)


class MCHReportViewSet(BaseMCHViewSet):
    queryset = MCHReport.objects.all()
    serializer_class = MCHReportSerializer


class WeeklyPlanViewSet(BaseMCHViewSet):
    queryset = WeeklyPlan.objects.all()
    serializer_class = WeeklyPlanSerializer


class ClientFollowUpViewSet(BaseMCHViewSet):
    queryset = ClientFollowUp.objects.all()
    serializer_class = ClientFollowUpSerializer

    def get_queryset(self):
        qs = records_queryset_for_user(self.queryset.model, self.request.user)
        client_id = self.request.query_params.get("client")
        created_by = self.request.query_params.get("created_by")
        
        # Apply filters
        if client_id:
            qs = qs.filter(client_id=client_id)
        elif created_by:
            # For Super Admin, allow filtering any user's follow-ups
            if self.request.user.role == User.ROLE_SUPER_ADMIN:
                qs = self.queryset.model.objects.filter(created_by_id=created_by)
            else:
                # For other roles, only filter within their accessible records
                qs = qs.filter(created_by_id=created_by)
        
        return qs.order_by("-created_at").select_related("created_by", "created_by__region", "client", "client__created_by", "client__created_by__region")


def mentor_mother_names_queryset(request):
    user = request.user
    if user.role == User.ROLE_SUPER_ADMIN:
        qs_clients = ClientRegistration.objects.values_list("mentor_mother_name", flat=True).distinct()
        qs_reports = MCHReport.objects.values_list("mentor_mother_name", flat=True).distinct()
        qs_plans = WeeklyPlan.objects.values_list("mentor_mother_name", flat=True).distinct()
    else:
        qs = records_queryset_for_user(ClientRegistration, user)
        qs_clients = qs.values_list("mentor_mother_name", flat=True).distinct()
        qs_reports = records_queryset_for_user(MCHReport, user).values_list("mentor_mother_name", flat=True).distinct()
        qs_plans = records_queryset_for_user(WeeklyPlan, user).values_list("mentor_mother_name", flat=True).distinct()
    names = sorted(set(chain(qs_clients, qs_reports, qs_plans)))
    return [n for n in names if n]


class MentorMotherNamesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        names = mentor_mother_names_queryset(request)
        return Response({"names": names})

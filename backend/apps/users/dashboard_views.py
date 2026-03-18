from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from django.db import models
from apps.records.models import ClientRegistration, ClientFollowUp, MCHReport, WeeklyPlan

User = get_user_model()


def can_access_dashboard(user):
    """Super Admin and PM always; Mentor Mother only if they have dashboard.view."""
    if user.role == User.ROLE_SUPER_ADMIN or user.role == User.ROLE_PM:
        return True
    if user.role == User.ROLE_MENTOR_MOTHER:
        return user.feature_permissions.filter(code="dashboard.view").exists()
    return False


def get_dashboard_user_ids(request):
    """Return set of user IDs the current user is allowed to see in dashboard stats."""
    user = request.user
    if user.role == User.ROLE_SUPER_ADMIN:
        return None  # None means no filter (all users)
    if user.role == User.ROLE_PM:
        mm_ids = list(User.objects.filter(pm=user).values_list("id", flat=True))
        return set(mm_ids) | {user.id}
    # MENTOR_MOTHER: only self
    return {user.id}


class DashboardStatsPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and can_access_dashboard(request.user)
        )


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, DashboardStatsPermission]

    def get(self, request):
        user_ids = get_dashboard_user_ids(request)
        
        if user_ids is None:
            # Use single efficient queries with aggregates
            user_stats = User.objects.aggregate(
                total_users=models.Count('id')
            )
            client_stats = ClientRegistration.objects.aggregate(
                total_clients=models.Count('id'),
                total_green=models.Sum('total_green_cases'),
                total_blue=models.Sum('total_blue_cases')
            )
            mch_stats = MCHReport.objects.aggregate(
                total_mch_reports=models.Count('id'),
                total_green=models.Sum('total_green'),
                total_blue=models.Sum('total_blue')
            )
            plan_stats = WeeklyPlan.objects.aggregate(
                total_weekly_plans=models.Count('id')
            )
            followup_stats = ClientFollowUp.objects.aggregate(
                total_followups=models.Count('id')
            )
        else:
            # Filtered version with single queries
            user_stats = User.objects.filter(id__in=user_ids).aggregate(
                total_users=models.Count('id')
            )
            client_stats = ClientRegistration.objects.filter(created_by_id__in=user_ids).aggregate(
                total_clients=models.Count('id'),
                total_green=models.Sum('total_green_cases'),
                total_blue=models.Sum('total_blue_cases')
            )
            mch_stats = MCHReport.objects.filter(created_by_id__in=user_ids).aggregate(
                total_mch_reports=models.Count('id'),
                total_green=models.Sum('total_green'),
                total_blue=models.Sum('total_blue')
            )
            plan_stats = WeeklyPlan.objects.filter(created_by_id__in=user_ids).aggregate(
                total_weekly_plans=models.Count('id')
            )
            followup_stats = ClientFollowUp.objects.filter(created_by_id__in=user_ids).aggregate(
                total_followups=models.Count('id')
            )

        return Response({
            "total_users": user_stats['total_users'],
            "total_clients": client_stats['total_clients'],
            "total_mch_reports": mch_stats['total_mch_reports'],
            "total_weekly_plans": plan_stats['total_weekly_plans'],
            "total_followups": followup_stats['total_followups'],
        })

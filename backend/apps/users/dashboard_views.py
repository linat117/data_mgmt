from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from apps.records.models import ClientRegistration, MCHReport, WeeklyPlan

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
            total_users = User.objects.count()
            total_clients = ClientRegistration.objects.count()
            total_mch_reports = MCHReport.objects.count()
            total_weekly_plans = WeeklyPlan.objects.count()
        else:
            total_users = User.objects.filter(id__in=user_ids).count()
            total_clients = ClientRegistration.objects.filter(created_by_id__in=user_ids).count()
            total_mch_reports = MCHReport.objects.filter(created_by_id__in=user_ids).count()
            total_weekly_plans = WeeklyPlan.objects.filter(created_by_id__in=user_ids).count()

        return Response({
            "total_users": total_users,
            "total_clients": total_clients,
            "total_mch_reports": total_mch_reports,
            "total_weekly_plans": total_weekly_plans,
        })

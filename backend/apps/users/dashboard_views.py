from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from apps.records.models import ClientRegistration, MCHReport, WeeklyPlan
from apps.users.views import IsAdminPermission

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminPermission]

    def get(self, request):
        total_users = User.objects.count()
        total_clients = ClientRegistration.objects.count()
        total_mch_reports = MCHReport.objects.count()
        total_weekly_plans = WeeklyPlan.objects.count()

        return Response({
            'total_users': total_users,
            'total_clients': total_clients,
            'total_mch_reports': total_mch_reports,
            'total_weekly_plans': total_weekly_plans,
        })

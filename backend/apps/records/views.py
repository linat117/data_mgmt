from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from itertools import chain
from .models import ClientRegistration, MCHReport, WeeklyPlan
from .serializers import ClientRegistrationSerializer, MCHReportSerializer, WeeklyPlanSerializer
from apps.audit.services import log_audit_action

class IsOwnerOrAdminPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'ADMIN' or obj.created_by == request.user

class BaseMCHViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminPermission]

    def get_queryset(self):
        qs = self.queryset.all() if self.request.user.role == 'ADMIN' else self.queryset.filter(created_by=self.request.user)
        return qs.select_related('created_by')

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        log_audit_action(self.request.user, 'CREATE', instance, self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_audit_action(self.request.user, 'UPDATE', instance, self.request)

    def perform_destroy(self, instance):
        log_audit_action(self.request.user, 'DELETE', instance, self.request)
        instance.delete()

class ClientRegistrationViewSet(BaseMCHViewSet):
    queryset = ClientRegistration.objects.all().order_by('-created_at')
    serializer_class = ClientRegistrationSerializer

class MCHReportViewSet(BaseMCHViewSet):
    queryset = MCHReport.objects.all().order_by('-created_at')
    serializer_class = MCHReportSerializer

class WeeklyPlanViewSet(BaseMCHViewSet):
    queryset = WeeklyPlan.objects.all().order_by('-created_at')
    serializer_class = WeeklyPlanSerializer


def mentor_mother_names_queryset(request):
    """Distinct mentor mother names from clients, reports, and plans (filtered by permission)."""
    user = request.user
    if user.role == 'ADMIN':
        qs_clients = ClientRegistration.objects.values_list('mentor_mother_name', flat=True).distinct()
        qs_reports = MCHReport.objects.values_list('mentor_mother_name', flat=True).distinct()
        qs_plans = WeeklyPlan.objects.values_list('mentor_mother_name', flat=True).distinct()
    else:
        qs_clients = ClientRegistration.objects.filter(created_by=user).values_list('mentor_mother_name', flat=True).distinct()
        qs_reports = MCHReport.objects.filter(created_by=user).values_list('mentor_mother_name', flat=True).distinct()
        qs_plans = WeeklyPlan.objects.filter(created_by=user).values_list('mentor_mother_name', flat=True).distinct()
    names = sorted(set(chain(qs_clients, qs_reports, qs_plans)))
    return [n for n in names if n]


class MentorMotherNamesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        names = mentor_mother_names_queryset(request)
        return Response({'names': names})

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet
from apps.users.auth_views import CustomLoginView, HealthView
from apps.users.dashboard_views import DashboardStatsView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthView.as_view(), name='health'),
    path('api/v1/auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/v1/', include(router.urls)),
    path('api/v1/records/', include('apps.records.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]

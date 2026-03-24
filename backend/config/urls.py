from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet, RegionViewSet, FeaturePermissionViewSet
from apps.users.auth_views import CustomLoginView, HealthView, MeView
from apps.users.dashboard_views import DashboardStatsView
from apps.users.profile_views import ProfileView, PasswordChangeView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'regions', RegionViewSet, basename='region')
router.register(r'permissions', FeaturePermissionViewSet, basename='featurepermission')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthView.as_view(), name='health'),
    path('api/v1/auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/me/', MeView.as_view(), name='me'),
    path('api/v1/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/v1/profile/', ProfileView.as_view(), name='profile'),
    path('api/v1/profile/change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('api/v1/', include(router.urls)),
    path('api/v1/records/', include('apps.records.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]

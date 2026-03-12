"""
Custom JWT auth - accepts email and password, returns tokens.
"""
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model


class HealthView(APIView):
    """Simple health check - no auth required."""

    permission_classes = []
    authentication_classes = []

    def get(self, request):
        return Response({'ok': True}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(APIView):
    """Accept JSON body with email and password. CSRF exempt for cross-origin API calls."""

    permission_classes = []  # Allow unauthenticated
    authentication_classes = []

    def post(self, request):
        try:
            # Parse body manually to avoid DRF parser failing on edge cases (empty body, proxy quirks)
            data = {}
            if request.body:
                try:
                    body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
                    data = json.loads(body) or {}
                except json.JSONDecodeError:
                    return Response(
                        {'detail': 'Invalid JSON body'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            email = (data.get('email') or data.get('username') or '').strip()
            password = data.get('password') or ''

            if not email or not password:
                return Response(
                    {
                        'detail': 'Email and password are required',
                        'received_keys': list(data.keys()) if isinstance(data, dict) else 'not a dict',
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            User = get_user_model()
            user = authenticate(request, **{User.USERNAME_FIELD: email}, password=password)

            if user is None:
                return Response(
                    {'detail': 'No active account found with the given credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not getattr(user, 'is_active', True):
                return Response(
                    {'detail': 'Account is disabled'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(APIView):
    """Return current user profile: id, email, role, names, region, pm, permission_codes."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        user = request.user
        permission_codes = list(user.feature_permissions.values_list('code', flat=True))
        data = {
            'user_id': str(user.id),
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'role': getattr(user, 'role', None),
            'phone_number': getattr(user, 'phone_number', '') or '',
            'region': None,
            'pm': None,
            'permission_codes': permission_codes,
        }
        if user.region_id:
            data['region'] = {'id': str(user.region.id), 'name': user.region.name, 'code': user.region.code}
        if user.pm_id:
            data['pm'] = {'id': str(user.pm.id), 'email': user.pm.email}
        return Response(data, status=status.HTTP_200_OK)

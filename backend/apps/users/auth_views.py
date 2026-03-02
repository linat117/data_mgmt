"""
Custom JWT auth - accepts email and password, returns tokens.
"""
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


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
            # Prefer request.data (DRF-parsed), fallback to manual JSON parse
            data = getattr(request, 'data', None)
            if not data and request.body:
                try:
                    body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
                    data = json.loads(body)
                except json.JSONDecodeError:
                    return Response(
                        {'detail': 'Invalid JSON body'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            data = data or {}

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

            user = authenticate(request, username=email, password=password)

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

"""
Custom JWT auth - accepts email and password, returns tokens.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class CustomLoginView(APIView):
    """Accept JSON body with email and password. No DRF serializer validation."""

    permission_classes = []  # Allow unauthenticated
    authentication_classes = []

    def post(self, request):
        try:
            # Accept both JSON and form data
            if request.content_type and 'json' in request.content_type:
                data = request.data
            else:
                data = getattr(request, 'data', None) or {}

            email = (data.get('email') or data.get('username') or '').strip()
            password = data.get('password') or ''

            if not email or not password:
                return Response(
                    {'detail': 'Email and password are required'},
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

"""
Custom JWT auth - accepts 'email' in request and returns clear errors.
"""
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept 'email' or 'username' in request body."""

    def validate(self, attrs):
        # Support both 'email' and 'username' (some clients send username with email value)
        email = attrs.get('email') or attrs.get('username', '').strip()
        password = attrs.get('password', '')

        if not email or not password:
            from rest_framework import exceptions
            raise exceptions.AuthenticationFailed(
                'Email and password are required',
                code='missing_credentials'
            )

        user = authenticate(
            self.context.get('request'),
            username=email,
            password=password
        )

        if user is None:
            from rest_framework import exceptions
            raise exceptions.AuthenticationFailed(
                'No active account found with the given credentials',
                code='invalid_credentials'
            )

        if not getattr(user, 'is_active', True):
            from rest_framework import exceptions
            raise exceptions.AuthenticationFailed(
                'Account is disabled',
                code='user_disabled'
            )

        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

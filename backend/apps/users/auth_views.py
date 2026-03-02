"""
Custom JWT auth - explicitly accepts 'email' and 'password' in request body.
"""
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """Explicitly use email and password - no username field."""
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').strip()
        password = attrs.get('password', '')

        user = authenticate(
            self.context.get('request'),
            username=email,
            password=password
        )

        if user is None:
            raise exceptions.AuthenticationFailed(
                'No active account found with the given credentials',
                code='invalid_credentials'
            )

        if not getattr(user, 'is_active', True):
            raise exceptions.AuthenticationFailed(
                'Account is disabled',
                code='user_disabled'
            )

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

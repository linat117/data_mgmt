from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from django.contrib.auth import get_user_model

from .serializers import ProfileSerializer, PasswordChangeSerializer

User = get_user_model()


class ProfileView(APIView):
    """
    Get and update the current user's profile information.
    GET: Retrieve user profile
    PATCH: Update user profile (first_name, last_name, phone_number)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get the current user's profile."""
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update the current user's profile."""
        serializer = ProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(UpdateAPIView):
    """
    Change the current user's password.
    Requires current_password, new_password, and confirm_password.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def get_object(self):
        """Return the current user."""
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Handle password change."""
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Password changed successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

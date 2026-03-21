"""
Custom validators for the users app.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """Validate phone number format."""
    if not value:
        return  # Phone number is optional
    
    # Remove common formatting characters
    phone = re.sub(r'[\s\-\(\)]+', '', value)
    
    # Check if phone number contains only digits and is reasonable length
    if not re.match(r'^\d+$', phone):
        raise ValidationError(_('Phone number can only contain digits.'))
    
    if len(phone) < 10 or len(phone) > 15:
        raise ValidationError(_('Phone number must be between 10 and 15 digits.'))


def validate_role_assignment(user, role):
    """Validate that the role assignment is allowed based on current user role."""
    if user.role == 'PM' and role != 'MENTOR_MOTHER':
        raise ValidationError(_('PM can only create Mentor Mother users.'))
    
    if user.role == 'MENTOR_MOTHER' and role != 'MENTOR_MOTHER':
        raise ValidationError(_('Mentor Mother cannot create users with other roles.'))

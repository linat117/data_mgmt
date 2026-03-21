"""
Custom validators for the records app.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_age(value):
    """Validate that age is reasonable for client registration."""
    if value < 0:
        raise ValidationError(_('Age cannot be negative.'))
    if value > 120:
        raise ValidationError(_('Age cannot exceed 120 years.'))
    if value < 15:
        raise ValidationError(_('Client must be at least 15 years old.'))


def validate_positive_integer(value):
    """Validate that a value is a positive integer."""
    if value < 0:
        raise ValidationError(_('Value cannot be negative.'))


def validate_weight(value):
    """Validate weight in kg."""
    if value is None:
        return  # Weight is optional
    if value <= 0:
        raise ValidationError(_('Weight must be greater than 0.'))
    if value > 300:
        raise ValidationError(_('Weight seems unrealistic. Please verify.'))


def validate_muac(value):
    """Validate MUAC (Mid-Upper Arm Circumference) in mm."""
    if value is None:
        return  # MUAC is optional
    if value <= 0:
        raise ValidationError(_('MUAC must be greater than 0.'))
    if value > 500:
        raise ValidationError(_('MUAC seems unrealistic. Please verify.'))


def validate_sex(value):
    """Validate sex field."""
    valid_choices = ['M', 'F']
    if value not in valid_choices:
        raise ValidationError(_('Sex must be either "M" or "F".'))

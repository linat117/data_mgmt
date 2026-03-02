import uuid
from django.db import models
from django.conf import settings

class ClientRegistration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor_mother_name = models.CharField(max_length=255)
    date = models.DateField()
    total_green_cases = models.IntegerField(default=0)
    total_blue_cases = models.IntegerField(default=0)
    
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    sex = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')])
    folder_number = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    muac = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    identified_problem = models.TextField()
    counseling_given = models.TextField()
    demonstration_shown = models.TextField(blank=True, null=True)
    anything_additional = models.TextField(blank=True, null=True)
    problem_faced_by_mm = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.date}"

class MCHReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor_mother_name = models.CharField(max_length=255)
    date = models.DateField()
    total_green = models.IntegerField(default=0)
    total_blue = models.IntegerField(default=0)

    # Use JSONField to store the variable metrics exactly as requested in the document
    metrics = models.JSONField(default=dict)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"MCH Report - {self.mentor_mother_name} - {self.date}"

class WeeklyPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor_mother_name = models.CharField(max_length=255)
    date = models.DateField()
    district = models.CharField(max_length=255)
    
    day_of_week = models.CharField(max_length=20)
    client_name = models.CharField(max_length=255)
    content = models.TextField()
    objective = models.TextField()
    observation = models.TextField()

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Weekly Plan - {self.mentor_mother_name} - {self.date} - {self.day_of_week}"

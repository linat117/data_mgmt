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

    # Additional SPSS-aligned fields (optional)
    spss_start_date = models.DateField(null=True, blank=True)
    spss_first_name = models.CharField(max_length=255, null=True, blank=True)
    spss_last_name = models.CharField(max_length=255, null=True, blank=True)
    spss_marital_status_code = models.IntegerField(null=True, blank=True)
    spss_job = models.CharField(max_length=255, null=True, blank=True)
    spss_payment = models.IntegerField(null=True, blank=True)
    spss_number_child_deaths = models.IntegerField(null=True, blank=True)
    spss_number_children_sd = models.IntegerField(null=True, blank=True)
    spss_medical_record = models.IntegerField(null=True, blank=True)
    spss_pregnant_record = models.IntegerField(null=True, blank=True)
    spss_lactate = models.IntegerField(null=True, blank=True)
    spss_nutrition_status = models.IntegerField(null=True, blank=True)
    spss_starting_month = models.CharField(max_length=50, null=True, blank=True)
    spss_first_pv_date = models.DateField(null=True, blank=True)
    spss_number_miscarriages = models.IntegerField(null=True, blank=True)
    spss_immunization_count = models.IntegerField(null=True, blank=True)
    spss_delivery_status = models.IntegerField(null=True, blank=True)
    spss_delivery_date = models.DateField(null=True, blank=True)
    spss_child_death_after = models.IntegerField(null=True, blank=True)
    spss_breastfeeding_status = models.IntegerField(null=True, blank=True)
    spss_rh_factor = models.IntegerField(null=True, blank=True)
    spss_no_antenatal = models.IntegerField(null=True, blank=True)
    spss_no_postnatal = models.IntegerField(null=True, blank=True)
    spss_child_no_after = models.IntegerField(null=True, blank=True)
    spss_second_preg_date = models.DateField(null=True, blank=True)
    spss_second_pregnancy = models.IntegerField(null=True, blank=True)
    spss_second_breastfeeding = models.IntegerField(null=True, blank=True)
    spss_second_antenatal = models.IntegerField(null=True, blank=True)
    spss_second_postnatal = models.IntegerField(null=True, blank=True)
    spss_second_immunization = models.IntegerField(null=True, blank=True)
    spss_second_delivery_date = models.DateField(null=True, blank=True)
    spss_number_children_after = models.IntegerField(null=True, blank=True)

    # Third pregnancy (same structure as second)
    spss_third_preg_date = models.DateField(null=True, blank=True)
    spss_third_pregnancy = models.IntegerField(null=True, blank=True)
    spss_third_breastfeeding = models.IntegerField(null=True, blank=True)
    spss_third_antenatal = models.IntegerField(null=True, blank=True)
    spss_third_postnatal = models.IntegerField(null=True, blank=True)
    spss_third_immunization = models.IntegerField(null=True, blank=True)
    spss_third_delivery_date = models.DateField(null=True, blank=True)
    spss_third_number_children_after = models.IntegerField(null=True, blank=True)

    # Flexible JSON field to store an arbitrary list of pregnancies after the first.
    # Each item is expected to be a dict with keys like:
    # { "preg_date", "pregnancy", "breastfeeding", "antenatal", "postnatal",
    #   "immunization", "delivery_date", "number_children_after" }.
    pregnancies = models.JSONField(default=list, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['mentor_mother_name', 'date']),
            models.Index(fields=['folder_number']),
            models.Index(fields=['date']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} - {self.date}"


class ClientFollowUp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        ClientRegistration,
        on_delete=models.CASCADE,
        related_name="followups",
    )
    date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        client_name = getattr(self.client, "name", None) or str(self.client_id)
        return f"Follow-up for {client_name} on {self.date}"


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

    class Meta:
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['mentor_mother_name', 'date']),
            models.Index(fields=['date']),
        ]
    
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

    class Meta:
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['mentor_mother_name', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['day_of_week']),
        ]

    def __str__(self):
        return f"Weekly Plan - {self.mentor_mother_name} - {self.date} - {self.day_of_week}"

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientRegistrationViewSet,
    ClientFollowUpViewSet,
    MCHReportViewSet,
    WeeklyPlanViewSet,
    MentorMotherNamesView,
)

router = DefaultRouter()
router.register(r"clients", ClientRegistrationViewSet)
router.register(r"client-followups", ClientFollowUpViewSet, basename="client-followups")
router.register(r"mch-reports", MCHReportViewSet)
router.register(r"weekly-plans", WeeklyPlanViewSet)

urlpatterns = [
    path("mentor-mothers/", MentorMotherNamesView.as_view()),
    path("", include(router.urls)),
]

from django.urls import path, include
from . import (
    providers,
    appointments, 
)

app_name = "api"


urlpatterns = [
    path("providers/", include((providers.urlpatterns, "providers"))),
    path("appointments/", include((appointments.urlpatterns, "appointments"))),
]
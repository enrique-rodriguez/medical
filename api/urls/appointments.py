from django.urls import path
from api.views import appointments


urlpatterns = [
    path("request/", appointments.create, name="request")
]
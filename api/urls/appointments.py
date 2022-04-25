from django.urls import path
from api.views import appointments


urlpatterns = [
    path("create/", appointments.create, name="create")
]
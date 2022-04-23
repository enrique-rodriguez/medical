from django.urls import path
from api.views import providers


urlpatterns = [
    path("", providers.fetch, name="fetch"),
    path("create/", providers.create, name="create"),
]
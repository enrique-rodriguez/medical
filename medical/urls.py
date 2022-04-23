from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render


index = lambda request: render(request, "index.html")

urlpatterns = [
    path('', index, name="index"),
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
]

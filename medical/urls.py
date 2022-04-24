from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
]

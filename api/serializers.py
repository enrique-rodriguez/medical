from rest_framework import serializers
from . import models


class AppointmentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AppointmentModel
        exclude = ["provider", "created", "approved"]
    provider_id = serializers.IntegerField()


class ProviderModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ProviderModel
        exclude = ["created", "approved", "specialty"]
    specialty_name = serializers.CharField()

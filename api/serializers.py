from rest_framework import serializers
from . import models


class AppointmentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AppointmentModel
        exclude = ["provider", "created", "approved", "start_time", "end_time"]
    provider_id = serializers.IntegerField()
    date = serializers.DateField()
    start = serializers.TimeField()
    end = serializers.TimeField()



class ProviderModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ProviderModel
        exclude = ["created", "approved", "specialty"]
    specialty_name = serializers.CharField()

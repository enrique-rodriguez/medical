from django.contrib import admin
from . import models


admin.site.register(models.ProviderModel)
admin.site.register(models.SpecialtyModel)
admin.site.register(models.AppointmentModel)
from django.db import models
from django.utils.translation import gettext_lazy as _


class SpecialtyModel(models.Model):
    class Meta:
        verbose_name = _("Specialty")
        verbose_name_plural = _("Specialties")

    name = models.CharField(verbose_name=_("Name"), max_length=100, unique=True)

    def __str__(self):
        return self.name


class ProviderModel(models.Model):
    class Meta:
        verbose_name = _("Provider")
        verbose_name_plural = _("Providers")
    
    created = models.DateTimeField(verbose_name=_("Date and Time Created"), auto_now_add=True)
    approved = models.DateTimeField(verbose_name=_("Date and Time Approved"), default=None, null=True, blank=True)
    full_name = models.CharField(verbose_name=_("Full Name"), max_length=100)
    specialty = models.ForeignKey(verbose_name=_("Specialty"), to=SpecialtyModel, on_delete=models.CASCADE)

    def __str__(self):
        return self.full_name

        
class AppointmentModel(models.Model):
    class Meta:
        verbose_name = _("Appointment")
        verbose_name_plural = _("Appointments")

    GENDER_CHOICES = [
        ('m', 'Male'),
        ('f', 'Female'),
        ('o', 'Other'),
    ]

    created = models.DateTimeField(verbose_name=_("Date and Time Created"), auto_now_add=True)
    approved = models.DateTimeField(verbose_name=_("Date and Time Approved"), default=None, null=True, blank=True)
    provider = models.ForeignKey(verbose_name=_("Provider"), to=ProviderModel, on_delete=models.CASCADE)
    start_time = models.DateTimeField(verbose_name=_("Start Time"))
    end_time = models.DateTimeField(verbose_name=_("End Time"))
    reason = models.CharField(verbose_name=_("Reason"), max_length=100)
    full_name = models.CharField(verbose_name=_("Full Name"), max_length=100)
    gender = models.CharField(verbose_name=_("Gender"), max_length=1, choices=GENDER_CHOICES)
    dob = models.DateField(verbose_name=_("Date of Birth"))
    phone_number = models.CharField(verbose_name=_("Phone Number"), max_length=15)

    def __str__(self):
        return f"{self.full_name}-{self.created}"
from api.models import AppointmentModel, ProviderModel, SpecialtyModel
from tests.api.test import ModelTestCase
from django.utils import timezone


class TestAppointmentModel(ModelTestCase):
    model = AppointmentModel
    
    def test_verbose_names(self):
        self.assertVerboseName("Appointment")
        self.assertVerboseNamePlural("Appointments")
    
    def test_field_names_verbose_names(self):
        self.assertFieldVerboseName("created", "Date and Time Created")
        self.assertFieldVerboseName("approved", "Date and Time Approved")
        self.assertFieldVerboseName("provider", "Provider")
        self.assertFieldVerboseName("start_time", "Start Time")
        self.assertFieldVerboseName("end_time", "End Time")
        self.assertFieldVerboseName("reason", "Reason")
        self.assertFieldVerboseName("full_name", "Full Name")
        self.assertFieldVerboseName("gender", "Gender")
        self.assertFieldVerboseName("dob", "Date of Birth")
        self.assertFieldVerboseName("phone_number", "Phone Number")

    def test_new_appointment_approval_timestamp_is_none(self):
        specialty = SpecialtyModel.objects.create(name="Specialty")

        provider = ProviderModel.objects.create(
            full_name="Name",
            specialty=specialty
        )

        appointment = AppointmentModel.objects.create(
            provider=provider,
            start_time=timezone.now(),
            end_time=timezone.now(),
            reason="Reason",
            full_name="First Last",
            gender="m",
            dob=timezone.now(),
            phone_number="7877878877",
        )

        self.assertIsNone(appointment.approved)
    
    def test_string_representation(self):
        specialty = SpecialtyModel.objects.create(name="Specialty")

        provider = ProviderModel.objects.create(
            full_name="Name",
            specialty=specialty
        )

        appointment = AppointmentModel.objects.create(
            provider=provider,
            start_time=timezone.now(),
            end_time=timezone.now(),
            reason="Reason",
            full_name="First Last",
            gender="m",
            dob=timezone.now(),
            phone_number="7877878877",
        )

        self.assertEqual(str(appointment), f"{appointment.full_name}-{appointment.created}")
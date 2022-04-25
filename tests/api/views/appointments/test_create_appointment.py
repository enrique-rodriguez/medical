from django.urls import reverse
from rest_framework import status
from api.views import appointments
from tests.api.test import APITestCase
from datetime import datetime, timedelta
from core.provider.data_access import provider_db
from core.appointment.data_access import appointment_db


class TestCreateRequestAPI(APITestCase):

    def setUp(self):
        self.url = reverse("api:appointments:create")

        provider_db.save({
            "full_name": 'Provider',
            "specialty": "Specialty"
        })

        self.post_data = {
            "provider_id": provider_db.last_inserted_id,
            "date": "2023-04-18",
            "start": "14:00",
            "end": "15:00",
            "reason": "Reason for appointment",
            "full_name": "John Doe",
            "gender": "m",
            "dob": "2000-04-18",
            "phone_number": "787-787-7788",
        }

        self.previous_count = appointment_db.count()

    def assertAppointmentNotCreated(self):
        self.assertEqual(appointment_db.count(), self.previous_count)
    
    def test_url_resolves(self):
        self.assertUrlResolves(self.url, appointments.create)
    
    def test_provider_not_found_gives_404_not_found(self):
        self.post_data['provider_id'] = "100"
        response = self.client.post(self.url+"?var=value", data=self.post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertAppointmentNotCreated()
        self.assertErrorMessageEquals(response, "Provider with id '100' was not found.")

    def test_start_time_in_the_past_gives_error(self):
        self.post_data['date'] = str( (datetime.now()-timedelta(days=5)).date() )
        response = self.client.post(self.url, data=self.post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertAppointmentNotCreated()
        self.assertErrorMessageEquals(response, "date must be a future date and time.")
    
    def test_end_time_in_the_past_gives_error(self):
        self.post_data['date'] = str( (datetime.now()-timedelta(days=5)).date() )
        response = self.client.post(self.url, data=self.post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertAppointmentNotCreated()
        self.assertErrorMessageEquals(response, "date must be a future date and time.")
    
    def test_invalid_dob_gives_error(self):
        self.post_data['dob'] = (datetime.now()+timedelta(days=1)).date()
        response = self.client.post(self.url, data=self.post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertAppointmentNotCreated()
        self.assertErrorMessageEquals(response, "Invalid DOB. Must be in the past.")

    def test_creates_appointment_valid_with_gender_choices(self):
        genders = ['m', 'f', 'o']
        for g in genders:
            self.post_data['gender'] = g
            response = self.client.post(self.url, data=self.post_data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(appointment_db.count(), len(genders))

    def test_invalid_gender_gives_error(self):
        self.post_data['gender'] = "i"
        response = self.client.post(self.url, data=self.post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        msg = response.json().get('gender')
        self.assertAppointmentNotCreated()
        self.assertEqual(msg, ['"i" is not a valid choice.'])
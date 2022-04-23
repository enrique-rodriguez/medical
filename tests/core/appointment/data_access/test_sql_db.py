from django.test import TestCase
from core.appointment.data_access.sql_db import SqlAppointmentDB


class TestSqlProviderDB(TestCase):

    def setUp(self):
        self.appointment_db = SqlAppointmentDB("api_appointmentmodel")

    def test_new_db_is_empty(self):
        self.assertEqual(self.appointment_db.count(), 0)
    
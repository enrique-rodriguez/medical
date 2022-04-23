from django.test import TestCase
from api.models import SpecialtyModel
from core.appointment.data_access.orm_db import OrmAppointmentDB


class TestOrmAppointmentDB(TestCase):

    def setUp(self):
        self.appointment_db = OrmAppointmentDB()

    def test_new_db_is_empty(self):
        self.assertEqual(self.appointment_db.count(), 0)
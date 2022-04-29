from tests.core.shared.mongodb_testcase import MongoTestCase
from core.appointment.data_access.nosql_db import NoSQLAppointmentDB


class TestNoSqlProverDB(MongoTestCase):

    def setUp(self):
        self.collection = self.get_collection("appointments")
        self.appointment_db = NoSQLAppointmentDB(collection=self.collection)
        self.previous_count = self.provider_db.count()
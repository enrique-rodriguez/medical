from api.models import AppointmentModel
from core.shared.data_access.orm_db import OrmDatabase
from core.appointment.domain.db import AppointmentDatabase
from django.utils.timezone import make_aware


class OrmAppointmentDB(OrmDatabase, AppointmentDatabase):
    model = AppointmentModel

    @OrmDatabase.map_to_dict
    def save(self, data):
        data["start_time"] = make_aware(data["start_time"])
        data["end_time"] = make_aware(data["end_time"])
        return super().save(data)
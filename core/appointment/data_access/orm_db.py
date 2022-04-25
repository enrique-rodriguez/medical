from api.models import AppointmentModel
from core.shared.data_access.orm_db import OrmDatabase
from core.appointment.domain.db import AppointmentDatabase
from django.utils.timezone import make_aware


class OrmAppointmentDB(OrmDatabase, AppointmentDatabase):
    model = AppointmentModel

    @OrmDatabase.map_to_dict
    def save(self, data):
        data_to_save = data.copy()
        data_to_save["start_time"] = make_aware(data_to_save["start_time"])
        data_to_save["end_time"] = make_aware(data_to_save["end_time"])
        return super().save(data_to_save)
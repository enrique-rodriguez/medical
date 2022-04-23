from api.models import AppointmentModel
from core.shared.data_access.orm_db import OrmDatabase
from core.appointment.domain.db import AppointmentDatabase


class OrmAppointmentDB(OrmDatabase, AppointmentDatabase):
    model = AppointmentModel
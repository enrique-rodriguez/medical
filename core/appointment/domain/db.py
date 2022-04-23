from core.shared.domain.db import Database
from core.appointment.domain import Appointment


class AppointmentDatabase(Database):
    entity = Appointment
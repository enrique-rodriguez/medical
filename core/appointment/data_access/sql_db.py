from core.shared.data_access.sql_db import SqlDatabase
from core.appointment.domain.db import AppointmentDatabase


class SqlAppointmentDB(SqlDatabase, AppointmentDatabase):
    fields = ["full_name", "specialty_id"]
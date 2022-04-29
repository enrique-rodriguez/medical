from core.shared.data_access.nosql_db import NoSqlDB
from core.appointment.domain.db import AppointmentDatabase


class NoSQLAppointmentDB(AppointmentDatabase, NoSqlDB):
    pass
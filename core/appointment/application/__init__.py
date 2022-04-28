from core.provider.data_access import provider_db
from core.appointment.data_access import appointment_db
from .create_appointment import CreateAppointmentHandler


create_appointment_handler = CreateAppointmentHandler(
    provider_db=provider_db,
    appointment_db=appointment_db
)
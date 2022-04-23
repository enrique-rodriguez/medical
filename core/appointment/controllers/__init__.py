from .create_appointment import CreateAppointmentController

from core.appointment.application import (
    request_appointment_handler
)


create_appointment_controller = CreateAppointmentController(request_appointment_handler)
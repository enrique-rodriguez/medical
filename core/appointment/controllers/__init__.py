from .create_appointment import CreateAppointmentController


from core import (
    query_bus,
    command_bus,
)

create_appointment_controller = CreateAppointmentController(command_bus, query_bus)
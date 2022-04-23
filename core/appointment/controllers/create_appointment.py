from core.shared.controllers import Controller
from core.shared.domain.exceptions import NotFoundError
from core.appointment.application.create_appointment import CreateAppointmentCommand
from core.appointment.application import CreateAppointmentHandler


class CreateAppointmentController(Controller):

    def __init__(self, create_appointment_handler: CreateAppointmentHandler, *args, **kwargs):
        super().__init__(method="POST", status=201, *args, **kwargs)
        self.create_appointment_handler = create_appointment_handler

    def dispatch(self, request):
        command = CreateAppointmentCommand(**request.body)

        try:
            self.create_appointment_handler(command)
        except (NotFoundError, ValueError) as error:
            self.status(400).data({ 'msg': str(error) })
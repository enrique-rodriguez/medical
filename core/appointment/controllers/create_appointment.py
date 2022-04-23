from core.shared.controllers import Controller
from core.shared.domain.exceptions import NotFoundError
from core.appointment.application.create_appointment import CreateAppointmentCommand


class CreateAppointmentController(Controller):

    def __init__(self, *args, **kwargs):
        super().__init__(method="POST", status=201, *args, **kwargs)

    def dispatch(self, request):
        command = CreateAppointmentCommand(**request.body)

        try:
            self.handler(command)
        except (NotFoundError, ValueError) as error:
            self.status(400).data({ 'msg': str(error) })
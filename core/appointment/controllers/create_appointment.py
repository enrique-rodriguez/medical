from core.shared.controllers import Controller
from datetime import datetime
from core.shared.domain.exceptions import NotFoundError
from core.appointment.application.create_appointment import CreateAppointmentCommand
from core.appointment.application import CreateAppointmentHandler


class CreateAppointmentController(Controller):

    def __init__(self, create_appointment_handler: CreateAppointmentHandler, *args, **kwargs):
        super().__init__(method="POST", *args, **kwargs)
        self.create_appointment_handler = create_appointment_handler

    def dispatch(self, request):
        self.status(201).data({})
        
        body = request.body.copy()
        date = body.pop("date")
        start, end = body.pop("start"), body.pop("end")
        
        body["start_time"] = datetime.combine(date, start)
        body["end_time"] = datetime.combine(date, end)

        command = CreateAppointmentCommand(**body)

        try:
            self.create_appointment_handler(command)
        except (NotFoundError, ValueError) as error:
            self.status(400).data({ 'msg': str(error) })
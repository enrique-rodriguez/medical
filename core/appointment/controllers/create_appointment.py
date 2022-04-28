from datetime import datetime
from core.shared.controllers import Controller
from core.shared.domain.exceptions import NotFoundError
from core.appointment.application.create_appointment import CreateAppointmentCommand


class CreateAppointmentController(Controller):

    def __init__(self, *args, **kwargs):
        super().__init__(method="POST", *args, **kwargs)

    def dispatch(self, request):
        self.status(201).data({})
        
        body = request.body.copy()
        date = body.pop("date")
        start, end = body.pop("start"), body.pop("end")
        
        body["start_time"] = datetime.combine(date, start)
        body["end_time"] = datetime.combine(date, end)

        self.execute(CreateAppointmentCommand(**body))            
    
    def handle_error(self, error):
        if isinstance(error, NotFoundError) or isinstance(error, ValueError):
            return self.status(400).data({ 'msg': str(error) })
        return super().handle_error(error)
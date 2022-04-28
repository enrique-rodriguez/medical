from unittest import mock
from datetime import date, time, datetime
from core.shared.controllers import HttpRequest
from tests.core.shared import ControllerTestCases
from core.shared.domain.exceptions import NotFoundError
from core.appointment.controllers import CreateAppointmentController
from core.appointment.application.create_appointment import CreateAppointmentCommand


class TestCreateAppointmentController(ControllerTestCases):

    def setUp(self):
        self.mock_command_bus = mock.Mock()
        self.mock_query_bus = mock.Mock()
        self.controller = CreateAppointmentController(self.mock_command_bus, self.mock_query_bus)
        self.request = HttpRequest(body=dict(
            date=date(2000, 12, 12),
            start=time(1, 0),
            end=time(2, 0),
        ))
    
    def test_handler_handles_appropriate_command(self):
        self.controller.dispatch(self.request)
        self.mock_command_bus.dispatch.assert_called_with(CreateAppointmentCommand(
            start_time=datetime(2000, 12, 12, 1, 0),
            end_time=datetime(2000, 12, 12, 2, 0),
        ))
    
    def test_gives_400_if_handler_gives_not_found(self):
        self.mock_command_bus.dispatch.side_effect = NotFoundError
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 400)

    def test_gives_400_if_handler_gives_value_error(self):
        self.mock_command_bus.dispatch.side_effect = ValueError
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 400)

from unittest import mock
from core.shared.controllers import HttpRequest
from tests.core.shared import ControllerTestCases
from core.shared.domain.exceptions import AlreadyExistsError
from core.provider.controllers import CreateProviderController


class TestCreateAppointmentController(ControllerTestCases):

    def setUp(self):
        self.mock_handler = mock.Mock()
        self.controller = CreateProviderController(create_provider_handler=self.mock_handler)
        self.request = HttpRequest(body=dict(), query=dict())
    
    def test_gives_400_if_provider_exists(self):
        self.mock_handler.side_effect = AlreadyExistsError
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 400)
    
    def test_gives_201_if_handler_creates_provider(self):
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 201)
from unittest import mock
from core.shared.controllers import HttpRequest
from tests.core.shared import ControllerTestCases
from core.provider.controllers import FetchProvidersController


class TestCreateAppointmentController(ControllerTestCases):

    def setUp(self):
        self.mock_handler = mock.Mock()
        self.controller = FetchProvidersController(fetch_providers_handler=self.mock_handler)
        self.request = HttpRequest(body=dict(), query=dict())
    
    def test_gives_200_after_fetching_providers(self):
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 200)
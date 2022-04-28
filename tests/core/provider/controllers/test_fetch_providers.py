from unittest import mock
from core.shared.controllers import HttpRequest
from tests.core.shared import ControllerTestCases
from core.provider.controllers import FetchProvidersController
from core.provider.application.fetch_providers import FetchProvidersQuery


class TestCreateAppointmentController(ControllerTestCases):

    def setUp(self):
        self.mock_command_bus = mock.Mock()
        self.mock_query_bus = mock.Mock()
        self.controller = FetchProvidersController(self.mock_command_bus, self.mock_query_bus)
        self.request = HttpRequest(body=dict(), query=dict())
    
    def test_gives_200_after_fetching_providers(self):
        self.controller.dispatch(self.request)
        self.mock_query_bus.dispatch.assert_called_with(FetchProvidersQuery())
        self.assertStatusCode(self.controller, 200)
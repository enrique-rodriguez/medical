from unittest import mock
from core.shared.controllers import HttpRequest
from tests.core.shared import ControllerTestCases
from core.shared.domain.exceptions import AlreadyExistsError
from core.provider.controllers import CreateProviderController
from core.provider.application.create_provider import CreateProviderCommand


class TestCreatProviderController(ControllerTestCases):

    def setUp(self):
        self.mock_command_bus = mock.Mock()
        self.mock_query_bus = mock.Mock()
        self.controller = CreateProviderController(self.mock_command_bus, self.mock_query_bus)
        self.request = self.get_request()
    
    def get_request(self):
        body = dict(full_name="First Last", specialty_name="Specialty")

        return HttpRequest(body=body, query=dict())
    
    def test_gives_400_if_provider_exists(self):
        self.mock_command_bus.dispatch.side_effect = AlreadyExistsError
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 400)
        self.mock_command_bus.dispatch.assert_called_with(CreateProviderCommand(
            full_name='First Last', 
            specialty='Specialty'))
    
    def test_gives_201_if_handler_creates_provider(self):
        self.controller.dispatch(self.request)
        self.assertStatusCode(self.controller, 201)
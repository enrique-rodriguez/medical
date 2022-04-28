from unittest import mock
from tests.core.shared import HandlerTestCase
from core.provider.application.create_provider import CreateProviderHandler
from core.provider.application.create_provider.request import CreateProviderCommand


class TestCreateProviderHandler(HandlerTestCase):

    def setUp(self):
        self.provider_factory = mock.Mock()
        self.provider_db = mock.Mock()
        self.command = self.get_command()
        self.handler = CreateProviderHandler(
            provider_db=self.provider_db,
            provider_factory=self.provider_factory
        )
    
    def get_command(self, full_name="Provider", specialty="Specialty"):
        return CreateProviderCommand(
            full_name=full_name, 
            specialty=specialty
        )
    
    def test_handler_is_registered(self):
        self.assertCommandRegistered(self.handler)
    
    def test_raises_error_if_provider_already_exists(self):
        mock_provider = self.provider_factory.create.return_value
        expected_error = "A provider with the name 'Provider' and specialty 'Specialty' already exists"
        self.assertHandlerRaises(self.handler, self.command, expected_error)
        self.provider_db.exists.assert_called_with(mock_provider)
    
    def test_raises_value_error_if_provider_name_is_less_than_5_characters(self):
        self.handler.set_provider_factory(None)
        self.handler.provider_factory.MIN_NAME_LENGTH = 5
        command = self.get_command(full_name="1234")
        expected_error = "Provider name must be atleast 5 charactes long."
        self.assertHandlerRaises(self.handler, command, expected_error)
    
    def test_raises_value_error_if_provider_specialty_is_less_than_5_characters(self):
        self.handler.set_provider_factory(None)
        self.handler.provider_factory.MIN_SPECIALTY_LENGTH = 5
        command = self.get_command(specialty="1234")
        expected_error = "Provider specialty must be atleast 5 charactes long."
        self.assertHandlerRaises(self.handler, command, expected_error)
    
    def test_creates_provider_and_stores_in_db(self):
        mock_provider = self.provider_factory.create.return_value
        self.provider_db.exists.return_value = False
        self.handler(self.command)
        self.provider_factory.create.assert_called_with(vars(self.command))
        self.provider_db.save.assert_called_with(mock_provider)
    
    def test_default_provider_factory_creates_provider_without_issues(self):
        self.handler.set_provider_factory(None)
        self.provider_db.exists.return_value = False
        self.handler(self.command)

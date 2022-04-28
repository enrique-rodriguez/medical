from unittest import mock
from tests.core.shared import HandlerTestCase
from core.provider.application.fetch_providers import FetchProvidersHandler, FetchProvidersQuery


class TestFetchProvidersHandler(HandlerTestCase):

    def setUp(self):
        self.provider_db = mock.Mock()
        self.handler = FetchProvidersHandler(self.provider_db)
    
    def test_handler_is_registered(self):
        self.assertQueryRegistered(self.handler)

    def test_fetches_providers_from_db(self):
        self.provider_db.fetch.return_value = []
        query = FetchProvidersQuery()
        result = self.handler.handle(query)
        
        self.assertTrue(isinstance(result, list))
        self.provider_db.fetch.assert_called_with(
            name=query.provider_name, 
            specialty=query.provider_specialty_name)


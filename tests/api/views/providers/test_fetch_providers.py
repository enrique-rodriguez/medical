from api.views import providers
from api.shortcuts import reverse
from rest_framework import status
from tests.api.test import APITestCase
from core.provider.data_access import provider_db


class TestCreateRequestAPI(APITestCase):

    def setUp(self):
        self.url_path = "api:providers:fetch"
        self.url = reverse(self.url_path)

        provider_db.save({
            'full_name': "John Doe",
            "specialty": "Specialty 1"
        })

        provider_db.save({
            'full_name': "Jane Doe",
            "specialty": "Specialty 2"
        })
    
    def test_url_resolves(self):
        self.assertUrlResolves(self.url, providers.fetch)
    
    def test_no_filter_fetches_all_providers(self):
        response = self.client.get(self.url)
        providers = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(providers), 2)
    
    def test_fetch_providers_by_specialty(self):
        url = reverse(self.url_path, query={'specialty': "Specialty 1"})
        response = self.client.get(url)
        providers = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(providers), 1)
        self.assertEqual(providers[0]["full_name"], "John Doe")
    
    def test_fetch_providers_by_name(self):
        url = reverse(self.url_path, query={'full_name': "John Doe"})
        response = self.client.get(url)
        providers = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(providers), 1)
        self.assertEqual(providers[0]["specialty"], "Specialty 1")
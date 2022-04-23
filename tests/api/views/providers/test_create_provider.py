from api.views import providers
from django.urls import reverse
from tests.api.test import APITestCase
from rest_framework import status
from core.provider.data_access import provider_db

class TestCreateRequestAPI(APITestCase):

    def setUp(self):
        self.url = reverse("api:providers:create")
        self.post_data = {
            'full_name': "Provider",
            'specialty_name': "Specialty"
        }
    
    def test_url_resolves(self):
        self.assertUrlResolves(self.url, providers.create)
    
    def test_creates_and_saves_the_provider(self):
        response = self.client.post(self.url, self.post_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json(), {})
        self.assertEqual(provider_db.count(), 1)
    
    def test_gives_error_400_with_no_post_data(self):
        response = self.client.post(self.url, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_provider_already_exists_gives_400(self):
        # Saves the provider for the first time.
        response = self.client.post(self.url, self.post_data)
        # Second time should give error because it already exists.
        response = self.client.post(self.url, self.post_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), { 'msg': "A provider with the name 'Provider' and specialty 'Specialty' already exists"})
        self.assertEqual(provider_db.count(), 1)
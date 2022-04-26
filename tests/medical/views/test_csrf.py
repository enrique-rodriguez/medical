from medical.views import csrf
from django.test import TestCase
from django.urls import resolve, reverse
from unittest.mock import patch


class TestIndexPage(TestCase):

    def setUp(self):
        self.url = reverse("csrf")

    def test_url_resolves(self):
        resolution = resolve(self.url).func

        self.assertEqual(resolution, csrf)
    
    @patch("medical.views.get_token")
    def test_GET(self, mock_get_token):
        mock_get_token.return_value = "csrf-token"
        response = self.client.get(self.url)
        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertIn("token", data)
        self.assertEqual(data.get("token"), "csrf-token")

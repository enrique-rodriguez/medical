from medical.views import csrf
from django.test import TestCase
from django.urls import resolve, reverse


class TestIndexPage(TestCase):

    def setUp(self):
        self.url = reverse("csrf")

    def test_url_resolves(self):
        resolution = resolve(self.url).func

        self.assertEqual(resolution, csrf)
    
    def test_GET(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.json())

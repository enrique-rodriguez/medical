from medical.views import index
from django.test import TestCase
from django.urls import resolve, reverse


class TestIndexPage(TestCase):

    def setUp(self):
        self.url = reverse("index")

    def test_url_resolves(self):
        resolution = resolve(self.url).func

        self.assertEqual(resolution, index)
    
    def test_GET(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
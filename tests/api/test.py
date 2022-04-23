from django.urls import resolve
from django.test import TestCase
from rest_framework.test import APITransactionTestCase


class ModelTestCase(TestCase):
    model = None

    def assertFieldVerboseName(self, field_name, expected):
        self.assertEqual(self.model._meta.get_field(field_name).verbose_name, expected)
    
    def assertVerboseName(self, expected):
        self.assertEqual(self.model._meta.verbose_name, expected)

    def assertVerboseNamePlural(self, expected):
        self.assertEqual(self.model._meta.verbose_name_plural, expected)


class APITestCase(APITransactionTestCase):
    message_key = 'msg'
    
    def assertUrlResolves(self, url, view):
        self.assertEqual(resolve(url).func, view)
    
    def assertErrorMessageEquals(self, response, expected):
        msg = response.json().get(self.message_key)
        self.assertEqual(msg, expected)
from unittest import TestCase
from core.provider.domain import Provider


class TestProviderEntity(TestCase):

    def setUp(self):
        self.provider = Provider(full_name="First Last", specialty="Specialty", id=1)
    
    def test_new_provider_is_not_approved(self):
        self.assertFalse(self.provider.is_approved())
    
    def test_approve_provider(self):
        self.provider.approve()
        self.assertTrue(self.provider.is_approved())

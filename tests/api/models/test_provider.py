from tests.api.test import ModelTestCase
from api.models import ProviderModel, SpecialtyModel



class TestProviderModel(ModelTestCase):
    model = ProviderModel

    def setUp(self):
        self.specialty = SpecialtyModel.objects.create(name="Specialty")
        self.provider = ProviderModel.objects.create(full_name="The Provider", specialty=self.specialty)
    
    def test_verbose_names(self):
        self.assertVerboseName("Provider")
        self.assertVerboseNamePlural("Providers")
    
    def test_field_names_verbose_names(self):
        self.assertFieldVerboseName("approved", "Date and Time Approved")
        self.assertFieldVerboseName("created", "Date and Time Created")
        self.assertFieldVerboseName("full_name", "Full Name")
        self.assertFieldVerboseName("specialty", "Specialty")
    
    def test_string_representation(self):
        self.assertEqual(str(self.provider), "The Provider")
    
    def test_new_provider_is_not_approved(self):
        self.assertIsNone(self.provider.approved)



class TestProviderSpecialtyModel(ModelTestCase):
    model = SpecialtyModel
    
    def test_verbose_names(self):
        self.assertVerboseName("Specialty")
        self.assertVerboseNamePlural("Specialties")
    
    def test_field_names_verbose_names(self):
        self.assertFieldVerboseName("name", "Name")
    
    def test_string_representation(self):
        specialty = SpecialtyModel.objects.create(name="My Specialty")

        self.assertEqual(str(specialty), "My Specialty")
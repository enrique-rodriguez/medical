# from django.test import TestCase
# from api.models import SpecialtyModel
# from core.provider.data_access.sql_db import SqlProviderDB


# class TestSqlProviderDB(TestCase):

#     def setUp(self):
#         self.specialty = SpecialtyModel.objects.create(name="Specialty")
#         self.provider_db = SqlProviderDB("api_providermodel")

#     def test_new_db_is_empty(self):
#         self.assertEqual(self.provider_db.count(), 0)
    
#     def test_new_provider_gets_added(self):
#         self.provider_db.save({
#             'full_name': "Medical Provider",
#             "specialty_id": self.specialty.id
#         })

#         self.assertEqual(self.provider_db.count(), 1)
    
#     def test_find_by_id_not_found_gives_none(self):
#         obj = self.provider_db.find(100)

#         self.assertIsNone(obj)
    
#     def test_find_by_id_exists_gives_obj(self):
#         self.provider_db.save({
#             'full_name': "Medical Provider",
#             "specialty_id": self.specialty.id
#         })

#         obj = self.provider_db.find(1)

#         self.assertIsNotNone(obj)
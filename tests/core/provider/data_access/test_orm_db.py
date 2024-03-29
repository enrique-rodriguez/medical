from django.test import TestCase
from core.provider.data_access.orm_db import OrmProviderDB
from core.provider.domain.provider import Provider
from datetime import datetime

class TestOrmProviderDB(TestCase):

    def setUp(self):
        self.provider_db = OrmProviderDB()
        self.previous_count = self.provider_db.count()

    def create_providers_for_fetch(self):
        self.provider_db.save({
            'full_name': "ABC",
            "specialty": "abc",
            "approved": datetime.now()
        })

        self.provider_db.save({
            'full_name': "DEF",
            "specialty": "abc",
            "approved": datetime.now()
        })

    def assertInserted(self):
        self.assertEqual(self.provider_db.count(), self.previous_count+1)

    def test_new_db_is_empty(self):
        self.assertEqual(self.provider_db.count(), 0)

    def test_new_provider_gets_added(self):
        self.provider_db.save({
            'full_name': "Medical Provider",
            "specialty": "Specialty"
        })

        self.assertInserted()
    
    def test_excludes_non_approved_providers(self):
        self.provider_db.save({
            'full_name': "Medical Provider",
            "specialty": "Specialty",
            "approved": None
        })

        count = self.provider_db.count(exclude_non_approved=True)

        self.assertEqual(count, self.previous_count)

    def test_find_by_id_not_found_gives_none(self):
        obj = self.provider_db.find(100)

        self.assertIsNone(obj)

    def test_find_by_id_exists_gives_obj(self):
        self.provider_db.save({
            'full_name': "Medical Provider",
            "specialty": "Specialty"
        })

        id = self.provider_db.last_inserted_id

        obj = self.provider_db.find(id)

        self.assertEqual(vars(obj), {
            "id": id,
            'full_name': "Medical Provider",
            "specialty": "Specialty",
            "approved": None
        })

    def test_no_match_for_criteria_gives_empty_list_of_providers(self):
        
        self.provider_db.save({
            'full_name': "ABC",
            "specialty": "abc"
        })

        objs = self.provider_db.fetch(name="DEF", specialty="def")

        providers = [vars(obj) for obj in objs]

        self.assertEqual(providers, [])

    def test_match_by_name_gives_one_result(self):

        self.create_providers_for_fetch()

        providers = [vars(obj) for obj in self.provider_db.fetch(name="ABC")]

        self.assertEqual(providers, [
            {
                'id': 1,
                'full_name': "ABC",
                "specialty": "abc",
                "approved": None
            }
        ])

    def test_match_by_specialty_gives_two_results(self):

        self.create_providers_for_fetch()

        providers = [vars(obj) for obj in self.provider_db.fetch(specialty="abc")]

        self.assertEqual(providers, [
            {
                'id': 1,
                'full_name': "ABC",
                "specialty": "abc",
                "approved": None
            },
            {
                'id': 2,
                'full_name': "DEF",
                "specialty": "abc",
                "approved": None
            }
        ])

    def test_provider_does_not_exists_gives_false(self):
        self.assertFalse(self.provider_db.exists({
            "full_name": "GHI",
            "specialty": "abc"
        }))
    
    def test_provider_does_exists_gives_true(self):
        data = {
            'full_name': "ABC",
            "specialty": "abc"
        }

        self.provider_db.save(data)

        self.assertTrue(self.provider_db.exists(data))
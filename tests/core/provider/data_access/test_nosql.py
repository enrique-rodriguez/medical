from datetime import datetime
from core.provider.data_access.nosql_db import NoSQLProviderDB
from tests.core.shared.mongodb_testcase import MongoTestCase


class TestNoSqlProverDB(MongoTestCase):

    def setUp(self):
        self.collection = self.get_collection("providers")
        self.provider_db = NoSQLProviderDB(collection=self.collection)
        self.previous_count = self.provider_db.count()

    def assertInserted(self,):
        self.assertEqual(self.provider_db.count(), self.previous_count+1)
    
    def save_provider(
        self, 
        full_name="Medical Provider", 
        specialty="Specialty", 
        approved=None
    ):
        self.provider_db.save({
            'full_name': full_name,
            "specialty": specialty,
            "approved": approved
        })

    def create_providers_for_fetch(self):
        objs = [
            {
                'full_name': "ABC",
                "specialty": "abc",
                "approved": datetime.now()
            },
            {
                'full_name': "DEF",
                "specialty": "abc",
                "approved": datetime.now()
            }
        ]

        for obj in objs:
            self.save_provider(**obj)


    def test_excludes_non_approved_providers(self):
        self.save_provider()

        count = self.provider_db.count(exclude_non_approved=True)

        self.assertEqual(count, self.previous_count)


    def test_no_match_for_criteria_gives_empty_list_of_providers(self):
        self.save_provider(full_name="ABC", specialty="abc")

        objs = self.provider_db.fetch(name="DEF", specialty="def")

        self.assertEqual(objs, [])

    def test_match_by_name_gives_one_result(self):
        self.create_providers_for_fetch()

        providers = self.provider_db.fetch(name="ABC")

        self.assertEqual(len(providers), 1)

    def test_match_by_LIKE_name_gives_one_result(self):
        self.create_providers_for_fetch()

        providers = self.provider_db.fetch(name="B")

        self.assertEqual(len(providers), 1)

    def test_match_by_specialty_gives_two_results(self):
        self.create_providers_for_fetch()

        providers = self.provider_db.fetch(specialty="abc")

        self.assertEqual(len(providers), 2)

    def test_match_by_LIKE_specialty_gives_two_results(self):
        self.create_providers_for_fetch()

        providers = self.provider_db.fetch(specialty="b")

        self.assertEqual(len(providers), 2)
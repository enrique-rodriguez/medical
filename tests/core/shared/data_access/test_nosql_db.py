from core.shared.data_access.nosql_db import NoSqlDB
from tests.core.shared.mongodb_testcase import MongoTestCase


class NoSql(MongoTestCase):

    def setUp(self):
        self.collection = self.get_collection("my_collection")
        self.my_collection_db = NoSqlDB(collection=self.collection)
        self.previous_count = self.my_collection_db.count()

    def assertInserted(self,):
        self.assertEqual(self.my_collection_db.count(), self.previous_count+1)
    
    def save_obj(
        self, 
        field1="Field 1", 
        field2="Field 2", 
    ):
        self.my_collection_db.save({
            "field1": field1,
            "field2": field2,
        })

    def test_new_db_is_empty(self):
        self.assertEqual(self.my_collection_db.count(), 0)

    def test_new_obj_gets_added(self):
        self.save_obj()

        self.assertInserted()

    def test_find_by_id_not_found_gives_none(self):
        obj = self.my_collection_db.find("626af9c8942b5611e9da5980")

        self.assertIsNone(obj)

    def test_find_by_id_exists_gives_obj(self):
        self.save_obj()

        id = self.my_collection_db.last_inserted_id

        obj = self.my_collection_db.find(id)

        self.assertTrue(isinstance(obj, dict))


    def test_obj_does_not_exists_gives_false(self):
        exists = self.my_collection_db.exists({
            "field1": "Field 1",
            "field2": "Field 2"
        })

        self.assertFalse(exists)

    def test_obj_does_exists_gives_true(self):
        self.save_obj(field1="Field 1", field2="Field 2")

        exists = self.my_collection_db.exists({
            "field1": "Field 1",
            "field2": "Field 2"
        })
        
        self.assertTrue(exists)

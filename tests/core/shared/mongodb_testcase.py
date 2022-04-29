import os
from unittest import TestCase
from pymongo.mongo_client import MongoClient
from pymongo.errors import ServerSelectionTimeoutError


class MongoTestCase(TestCase):
    CONNECTION_TIMEOUT = 10
    db_name = "test_database"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collections = []

    def run(self, result=None):
        if not self.mongo_client:
            return self._addSkip(result, self, "Could not connect to MongoDB server.")
        return super().run(result)

    def get_collection(self, collection_name):
        self.collections.append(self.db[collection_name])
        return self.collections[-1]

    def tearDown(self) -> None:
        self.delete_collections()

    def delete_collections(self):
        for collection in self.collections:
            self.db.drop_collection(collection)

    @classmethod
    def setUpClass(cls):
        cls.setup_database()

    @classmethod
    def tearDownClass(cls):
        cls.drop_database()

    @classmethod
    def setup_database(cls):
        host = os.environ.get("MONGO_DB_HOST")
        port = os.environ.get("MONGO_DB_PORT")
        port = int(port) if port else None

        cls.mongo_client = cls.get_client(host, port)

        if cls.mongo_client:
            cls.db = cls.mongo_client[cls.db_name]

    @classmethod
    def get_client(cls, host, port):

        client = MongoClient(host=host, port=port,
                             serverSelectionTimeoutMS=cls.CONNECTION_TIMEOUT)
        try:
            client.server_info()
        except ServerSelectionTimeoutError:
            return None
        return client

    @classmethod
    def drop_database(cls):
        if cls.mongo_client:
            cls.mongo_client.drop_database(cls.db_name)

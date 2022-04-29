from bson.objectid import ObjectId
from pymongo.collection import Collection
from core.shared.domain.db import Database


class NoSqlDB(Database):

    def __init__(self, collection: Collection) -> None:
        self.collection = collection

    def find(self, id):
        _id = ObjectId(id)
        collection = self.collection.find_one({'_id': _id})
        if collection:
            collection.pop("_id")
            collection["id"] = id
        return collection

    def count(self, query=None):
        query = query or {}
        return self.collection.count_documents(query)

    def persist(self, data):
        result = self.collection.insert_one(data)
        self.last_inserted_id = str(result.inserted_id)
    
    def exists(self, criteria):
        collection = self.collection.find_one(criteria)

        return collection is not None
import re
from core.shared.data_access.nosql_db import NoSqlDB
from core.provider.domain.db import ProviderDatabase


class NoSQLProviderDB(ProviderDatabase, NoSqlDB):

    def count(self, exclude_non_approved=False):
        query = {}
        if exclude_non_approved:
            query["approved"] = { "$not": { "$eq": None } }
        return super().count(query)
    
    def fetch(self, name=None, specialty=None):
        query = {}
        if name:
            query["full_name"] = re.compile(name, re.IGNORECASE)
        if specialty:
            query["specialty"] = re.compile(specialty, re.IGNORECASE)
        return list(self.collection.find(query))
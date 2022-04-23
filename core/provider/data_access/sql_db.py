from core.shared.data_access.sql_db import SqlDatabase
from core.provider.domain.db import ProviderDatabase


class SqlProviderDB(SqlDatabase, ProviderDatabase):
    fields = ["full_name", "specialty_id"]


    def fetch(self, criteria):
        return []
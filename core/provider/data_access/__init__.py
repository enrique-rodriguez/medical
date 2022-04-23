from .sql_db import SqlProviderDB
from .orm_db import OrmProviderDB, OrmSpecialtyDB


specialty_db = OrmSpecialtyDB()
provider_db = OrmProviderDB(specialty_db)
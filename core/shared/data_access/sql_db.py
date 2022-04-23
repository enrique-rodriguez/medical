from django.db import connection
from core.shared.domain.db import Database


def db_cursor(func):
    def inner(self, *args, **kwargs):
        with self.connection.cursor() as cursor:
            return func(self, cursor, *args, **kwargs)
    return inner


class SqlDatabase(Database):
    fields = []

    def __init__(self, tablename):
        super().__init__()
        self.tablename = tablename
    
    @property
    def connection(self):
        return connection

    def persist(self, data):
        self.insert(data)
    
    @db_cursor
    def find(self, cursor, id):
        cursor.execute(f"""SELECT * FROM {self.tablename} WHERE id=%s""", [id])
        objs = self.dictfetchall(cursor)

        if not objs: return None

        return self.entity(*objs[0])

    @db_cursor
    def insert(self, cursor, data):
        fields = ",".join(self.fields)
        values = ",".join(['%s']*len(self.fields))
        params = [data.get(field) for field in self.fields]

        cursor.execute(f"""INSERT INTO {self.tablename} ({fields}) VALUES ({values})""", params)
        self.last_inserted_id = cursor.lastrowid

    @db_cursor
    def count(self, cursor):
        cursor.execute(f"""SELECT COUNT(id) FROM {self.tablename}""")
        return cursor.fetchone()[0]

    @staticmethod
    def dictfetchall(cursor):
        columns = [col[0] for col in cursor.description]
        
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

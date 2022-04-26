import abc


class Database(abc.ABC):
    entity = None

    def __init__(self):
        self.last_inserted_id = None
    
    def map_to_dict(func):
        """
        Map the incoming argument to a dictionary if the type is of type 'self.entity'.
        """
        
        def inner(self, data):
            is_entity = self.entity and isinstance(data, self.entity)
            d = vars(data) if is_entity else data.copy()
            return func(self, data=d)
        return inner
    
    def map_to_entities(func):
        def inner(self, *args, **kwargs):
            objs = func(self, *args, **kwargs)
            return [self.to_entity(obj) for obj in objs]
        return inner
    
    @map_to_dict
    def save(self, data):
        self.persist(data)
    
    @abc.abstractmethod
    def to_entity(self, obj):
        pass
    
    @abc.abstractmethod
    def persist(self, data):
        "Child classes must implement this method."

    @abc.abstractmethod
    def find(self, id):
        "Child classes must implement this method."

    @abc.abstractmethod
    def count(self):
        "Child classes must implement this method."
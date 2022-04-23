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
            _data = vars(data) if is_entity else data
            return func(self, data=_data)
        return inner
    
    @map_to_dict
    def save(self, data):
        self.persist(data)
    
    @abc.abstractmethod
    def persist(self, data):
        "Child classes must implement this method."

    @abc.abstractmethod
    def find(self, id):
        "Child classes must implement this method."

    @abc.abstractmethod
    def count(self):
        "Child classes must implement this method."
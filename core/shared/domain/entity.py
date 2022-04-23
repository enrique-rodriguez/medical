import abc


class Entity(abc.ABC):
    
    def __init__(self, id=None):
        self.id = id

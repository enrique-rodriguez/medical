from datetime import datetime
from core.shared.domain import Entity


class Provider(Entity):
    
    def __init__(self, full_name, specialty, id=None, *args, **kwargs):
        super().__init__(id, *args, **kwargs)
        self.full_name = full_name
        self.specialty = specialty
        self.approved = None
    
    def approve(self):
        self.approved = datetime.now()
    
    def is_approved(self):
        return self.approved is not None
    
    @classmethod
    def create(cls, data):
        return cls(**data)
import inspect
from django.db.models import Model
from core.shared.domain.db import Database


class OrmDatabase(Database):
    model = None

    def persist(self, data):
        model, _ = self.model.objects.get_or_create(**data)
        self.last_inserted_id = model.id
    
    def count(self, exclude_non_approved=False):
        objects = self.model.objects.get_queryset()
        if exclude_non_approved:
            objects = objects.filter(approved__isnull=False)
        return objects.count()
    
    def find(self, id):
        objects = self.model.objects.filter(id=id)
        if not objects.exists():
            return None
        return self.to_entity(objects[0])
        
    def to_entity(self, model):
        data = {}
        for attr in inspect.getargspec(self.entity.__init__)[0][1:]:
            model_attr = getattr(model, attr)
            data[attr] = model_attr
            if isinstance(model_attr, Model):
                data[attr] = str(model_attr)

        return self.entity(**data)
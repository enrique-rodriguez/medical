import inspect
from django.db.models import Model
from core.shared.domain.db import Database


class OrmDatabase(Database):
    model = None
    filters = None

    def persist(self, data):
        model, _ = self.model.objects.get_or_create(**data)
        self.last_inserted_id = model.id
    
    def count(self):
        return self.model.objects.count()
    
    def find(self, id):
        objects = self.model.objects.filter(id=id)

        if not objects.exists():
            return None
        
        return self.to_entity(objects[0])
    
    def fetch(self, criteria):
        """
        Fetches objects using a search criteria
        """

        models = self.model.objects.get_queryset()

        for filter, mapping in self.filters.items():
            value = criteria.get(filter)
            if not value: continue
            models = models.filter(**{mapping: value})

        return [self.to_entity(model) for model in models]
    
    def to_entity(self, model):
        """
        Default behaviour for mapping model objects to entity objects.
        """

        data = {}
        for attr in inspect.getargspec(self.entity.__init__)[0][1:]:
            if not hasattr(model, attr): continue
            model_attr = getattr(model, attr)
            data[attr] = model_attr
            if isinstance(model_attr, Model):
                data[attr] = str(model_attr)

        return self.entity(**data)
    
    def exists(self, data):
        """
        Default behaviour for searching for model objects.
        """

        data_to_search = data
        if isinstance(data, self.entity):
            data_to_search = vars(data)
        return self.model.objects.filter(**data_to_search).exists()
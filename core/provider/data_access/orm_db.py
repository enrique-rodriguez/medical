from django.db.models import Q
from django.utils.timezone import make_aware
from api.models import ProviderModel, SpecialtyModel
from core.provider.domain.db import ProviderDatabase
from core.shared.data_access.orm_db import OrmDatabase


class OrmSpecialtyDB(OrmDatabase):
    model = SpecialtyModel


class OrmProviderDB(OrmDatabase, ProviderDatabase):
    model = ProviderModel

    def __init__(self, specialty_db=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.specialty_db = specialty_db or OrmSpecialtyDB()

    @ProviderDatabase.map_to_dict
    def save(self, data):
        specialty = data.pop("specialty", '')
        approved = data.pop("approved", None)
        if approved:
            data["approved"] = make_aware(approved)
        self.specialty_db.save({ "name": specialty })
        data["specialty_id"] = self.specialty_db.last_inserted_id
        return super().save(data)
    
    @ProviderDatabase.map_to_dict
    def exists(self, data):
        full_name = data.get("full_name")
        specialty = data.get("specialty")
        models = self.model.objects.filter(full_name=full_name, specialty__name=specialty)

        return models.exists()
    
    def fetch(self, name=None, specialty=None, is_approved=True):
        models = self.model.objects.filter(approved__isnull=not is_approved)
        if name and specialty:
            models = models.filter(Q(full_name__icontains=name) | Q(specialty__name__icontains=specialty))
        elif name:
            models = models.filter(full_name__icontains=name)
        elif specialty:
            models = models.filter(specialty__name__icontains=specialty)
        return [self.to_entity(model) for model in models]
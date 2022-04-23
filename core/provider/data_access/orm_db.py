from core.provider.domain import Provider
from api.models import ProviderModel, SpecialtyModel
from core.provider.domain.db import ProviderDatabase
from core.shared.data_access.orm_db import OrmDatabase


class OrmSpecialtyDB(OrmDatabase):
    model = SpecialtyModel


class OrmProviderDB(OrmDatabase, ProviderDatabase):
    entity = Provider
    model = ProviderModel
    filters = {
        "full_name": "full_name__icontains",
        "specialty": "specialty__name__icontains",
    }

    def __init__(self, specialty_db=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.specialty_db = specialty_db or OrmSpecialtyDB()

    @ProviderDatabase.map_to_dict
    def save(self, data):
        data_to_save = data.copy()
        specialty = data_to_save.pop('specialty')
        if specialty:
            self.specialty_db.save({ "name": specialty })
            data_to_save['specialty_id'] = self.specialty_db.last_inserted_id
        return super().save(data_to_save)
    
    @ProviderDatabase.map_to_dict
    def exists(self, data):

        models = self.model.objects.filter(
            full_name=data.get('full_name'),
            specialty__name=data.get('specialty')
        )

        return models.exists()
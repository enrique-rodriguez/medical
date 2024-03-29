from .query import FetchProvidersQuery
from core.shared.application import QueryHandler
from core.provider.domain.db import ProviderDatabase


class FetchProvidersHandler(QueryHandler):
    dto_class = FetchProvidersQuery

    def __init__(self, provider_db: ProviderDatabase):
        self.provider_db = provider_db
    
    def handle(self, query: FetchProvidersQuery):
        name = query.provider_name
        specialty = query.provider_specialty_name
        providers = self.provider_db.fetch(name=name, specialty=specialty)

        return [vars(provider) for provider in providers]
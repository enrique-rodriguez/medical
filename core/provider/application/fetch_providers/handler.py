from .query import FetchProvidersQuery
from core.shared.application import QueryHandler
from core.provider.domain.db import ProviderDatabase


class FetchProvidersHandler(QueryHandler):

    def __init__(self, provider_db: ProviderDatabase):
        self.provider_db = provider_db
    
    def handle(self, query: FetchProvidersQuery):

        providers = self.provider_db.fetch({
            "full_name": query.provider_name,
            "specialty": query.provider_specialty_name
        })

        return [vars(provider) for provider in providers]
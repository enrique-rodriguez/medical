from core.provider.data_access import provider_db
from .fetch_providers import FetchProvidersHandler
from .create_provider.handler import CreateProviderHandler


fetch_providers_handler = FetchProvidersHandler(provider_db)
create_provider_handler = CreateProviderHandler(provider_db)
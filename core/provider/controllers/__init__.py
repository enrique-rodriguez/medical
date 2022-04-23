from .fetch_providers import FetchProvidersController
from .create_provider import CreateProviderController

from core.provider.application import (
    fetch_providers_handler,
    create_provider_handler,
)


fetch_providers_controller = FetchProvidersController(fetch_providers_handler)
create_provider_controller = CreateProviderController(create_provider_handler)
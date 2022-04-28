from .fetch_providers import FetchProvidersController
from .create_provider import CreateProviderController

from core import (
    command_bus,
    query_bus
)


fetch_providers_controller = FetchProvidersController(command_bus, query_bus)
create_provider_controller = CreateProviderController(command_bus, query_bus)
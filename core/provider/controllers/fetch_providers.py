from core.provider.application.fetch_providers.handler import FetchProvidersHandler
from core.shared.controllers import Controller
from core.provider.application.fetch_providers import FetchProvidersQuery


class FetchProvidersController(Controller):

    def __init__(self, fetch_providers_handler: FetchProvidersHandler, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fetch_providers_handler = fetch_providers_handler

    def dispatch(self, request):
        query = FetchProvidersQuery(
            provider_name=request.query.get("full_name"),
            provider_specialty_name=request.query.get("specialty"),
        )
        
        providers = self.fetch_providers_handler(query)
        
        self.status(200).data(providers)

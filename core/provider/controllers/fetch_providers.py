from core.shared.controllers import Controller
from core.provider.application.fetch_providers import FetchProvidersQuery


class FetchProvidersController(Controller):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def dispatch(self, request):      
        providers = self.query(FetchProvidersQuery(
            provider_name=request.query.get("full_name"),
            provider_specialty_name=request.query.get("specialty"),
        ))
        
        self.status(200).data(providers)  

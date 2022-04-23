from core.provider import controllers
from api.utils import create_restframework_view
from api.serializers import ProviderModelSerializer


fetch = create_restframework_view(
    controller=controllers.fetch_providers_controller, 
)

create = create_restframework_view(
    controller=controllers.create_provider_controller,
    serializer=ProviderModelSerializer
)
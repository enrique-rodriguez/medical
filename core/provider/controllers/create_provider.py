from core.shared.controllers import Controller
from core.provider.application.create_provider import CreateProviderCommand
from core.provider.application import create_provider_handler
from core.shared.domain.exceptions import AlreadyExistsError


class CreateProviderController(Controller):

    def __init__(self, *args, **kwargs):
        super().__init__(method="POST", status=201, data={}, *args, **kwargs)

    def dispatch(self, request):
        command = CreateProviderCommand(
            full_name=request.body.get("full_name"),
            specialty=request.body.get("specialty_name")
        )

        try:
            create_provider_handler(command)
        except AlreadyExistsError as error:
            self.status(400).data({ 'msg': str(error) })

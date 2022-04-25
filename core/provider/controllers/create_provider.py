from core.provider.application.create_provider.handler import CreateProviderHandler
from core.shared.controllers import Controller
from core.shared.domain.exceptions import AlreadyExistsError
from core.provider.application.create_provider import CreateProviderCommand


class CreateProviderController(Controller):

    def __init__(self, create_provider_handler: CreateProviderHandler, *args, **kwargs):
        super().__init__(method="POST", *args, **kwargs)
        self.create_provider_handler = create_provider_handler

    def dispatch(self, request):
        self.status(201).data({})

        command = CreateProviderCommand(
            full_name=request.body.get("full_name"),
            specialty=request.body.get("specialty_name")
        )

        try:
            self.create_provider_handler(command)
        except AlreadyExistsError as error:
            self.status(400).data({ 'msg': str(error) })
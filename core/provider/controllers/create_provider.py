from core.shared.controllers import Controller
from core.shared.domain.exceptions import AlreadyExistsError
from core.provider.application.create_provider import CreateProviderCommand


class CreateProviderController(Controller):

    def __init__(self, *args, **kwargs):
        super().__init__(method="POST", *args, **kwargs)

    def dispatch(self, request):
        self.status(201).data({})

        return self.execute(CreateProviderCommand(
            full_name=request.body.get("full_name"),
            specialty=request.body.get("specialty_name")
        ))

    def handle_error(self, error):
        if isinstance(error, AlreadyExistsError):
            return self.status(400).data({ 'msg': str(error) })

        return super().handle_error(error)
from .request import CreateProviderCommand
from core.shared.application import CommandHandler
from core.provider.domain.factory import ProviderFactory
from core.shared.domain.exceptions import AlreadyExistsError


class CreateProviderHandler(CommandHandler):

    def __init__(self, provider_db, provider_factory=None):
        self.provider_db = provider_db
        self.set_provider_factory(provider_factory)
    
    def handle(self, command: CreateProviderCommand):
        provider = self.provider_factory.create(vars(command))
        if self.provider_db.exists(provider):
            raise AlreadyExistsError(f"A provider with the name '{command.full_name}' and specialty '{command.specialty}' already exists")
        self.provider_db.save(provider)
    
    def set_provider_factory(self, factory=None):
        self.provider_factory = factory or ProviderFactory
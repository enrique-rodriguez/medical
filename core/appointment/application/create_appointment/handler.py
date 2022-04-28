from .command import CreateAppointmentCommand
from core.shared.application import CommandHandler
from core.provider.domain.db import ProviderDatabase
from core.appointment.domain import AppointmentFactory
from core.shared.domain.exceptions import NotFoundError
from core.appointment.domain.db import AppointmentDatabase


class CreateAppointmentHandler(CommandHandler):
    dto_class = CreateAppointmentCommand

    def __init__(
            self,
            provider_db: ProviderDatabase,
            appointment_db: AppointmentDatabase,
            appointment_factory: AppointmentFactory = None
        ):

        self.provider_db = provider_db
        self.appointment_db = appointment_db
        self.set_appointment_factory(appointment_factory)

    def handle(self, command: CreateAppointmentCommand):
        provider_id = command.provider_id
        if not self.provider_db.find(provider_id):
            raise NotFoundError(f"Provider with id '{provider_id}' was not found.")
        appointment = self.appointment_factory.create(vars(command))
        self.appointment_db.save(appointment)

    def set_appointment_factory(self, factory=None):
        self.appointment_factory = factory or AppointmentFactory
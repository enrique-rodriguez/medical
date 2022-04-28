import abc
from core.shared.application import Command


class CommandHandler(abc.ABC):
    dto_class = None

    def __call__(self, command: Command):
        return self.handle(command)

    @abc.abstractmethod
    def handle(self, command: Command):
        "Child classes must implement this method."
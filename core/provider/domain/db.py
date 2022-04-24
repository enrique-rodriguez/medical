import abc
from core.provider.domain import Provider
from core.shared.domain.db import Database


class ProviderDatabase(Database):
    entity = Provider

    @abc.abstractmethod
    def fetch(self, name, specialty):
        "Child classes must implement this method."
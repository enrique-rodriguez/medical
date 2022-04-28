import abc
from core.shared.application import Query


class QueryHandler(abc.ABC):
    dto_class = None

    def __call__(self, query: Query):
        return self.handle(query)

    @abc.abstractmethod
    def handle(self, query: Query):
        "Child classes must implement this method."
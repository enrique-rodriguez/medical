import abc


class Controller(abc.ABC):

    def __init__(self, method="GET", status=500, data=None):
        self.method = method
        self.status_code = status
        self.response_data = data or {}
    
    @abc.abstractmethod
    def dispatch(self, request):
        "Child classes must implement this method."
    
    def status(self, status):
        self.status_code = status
        return self
    
    def data(self, data):
        self.response_data = data
        return self
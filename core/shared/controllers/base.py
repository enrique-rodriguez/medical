import abc


class Controller(abc.ABC):

    def __init__(self, command_bus, query_bus, method="GET", status=500, data=None):
        self.method = method
        self.status_code = status
        self.response_data = data or {}
        self.command_bus = command_bus
        self.query_bus = query_bus
    
    @property
    def response(self):
        return self.status_code, self.response_data
    
    @abc.abstractmethod
    def dispatch(self, request):
        "Child classes must implement this method."
    
    def execute(self, command):
        try:
            return self.command_bus.dispatch(command)
        except Exception as error:
            return self.handle_error(error)
    
    def handle_error(self, error):
        raise error
    
    def query(self, query):
        return self.query_bus.dispatch(query)
    
    def status(self, status):
        self.status_code = status
        return self
    
    def data(self, data):
        self.response_data = data
        return self
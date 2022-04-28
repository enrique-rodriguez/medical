

class Bus:
    
    def __init__(self, handlers=None):
        self.handlers = handlers or {}
    
    def register_many(self, handlers):
        for h in handlers: self.register(h)
    
    def register(self, handler):
        if self.is_registered(handler):
            raise ValueError(f"Handler '{handler.__class__.__name__}' is already registered")
        self.handlers[handler.dto_class] = handler

    def is_registered(self, handler):
        return self.handlers.get(handler.dto_class) is not None
    
    def dispatch(self, dto):
        handler = self.handlers.get(dto.__class__)
        if not handler:
            raise ValueError("Handler not found")
        return handler.handle(dto)

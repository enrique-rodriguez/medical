

class ApplicationError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


class NotFoundError(ApplicationError):
    def __init__(self, message="Not Found"):
        super().__init__("not-found", message)


class AlreadyExistsError(ApplicationError):
    def __init__(self, message="Already Exists"):
        super().__init__("already-exists", message)
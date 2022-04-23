from .provider import Provider


class ProviderFactory:
    MIN_NAME_LENGTH = 5
    MIN_SPECIALTY_LENGTH = 5
    
    @classmethod
    def create(cls, data):
        if len(data.get("full_name", "")) < cls.MIN_NAME_LENGTH:
            raise ValueError(f"Provider name must be atleast {cls.MIN_NAME_LENGTH} charactes long.")
        if len(data.get("specialty", "")) < cls.MIN_SPECIALTY_LENGTH:
            raise ValueError(f"Provider specialty must be atleast {cls.MIN_SPECIALTY_LENGTH} charactes long.")
        return Provider.create(data)
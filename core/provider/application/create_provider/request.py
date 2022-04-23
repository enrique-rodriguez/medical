from dataclasses import dataclass


@dataclass(frozen=True)
class CreateProviderCommand:
    full_name: str
    specialty: str
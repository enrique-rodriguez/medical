from dataclasses import dataclass


@dataclass(frozen=True)
class FetchProvidersQuery:
    provider_name: str = None
    provider_specialty_name: str = None
from dataclasses import dataclass


@dataclass(frozen=True)
class HttpRequest:
    query: dict = None
    body: dict = None
    params: dict = None
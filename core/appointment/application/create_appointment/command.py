from datetime import datetime
from dataclasses import dataclass


@dataclass(frozen=True)
class CreateAppointmentCommand:
    provider_id: int = None
    start_time: datetime = ""
    end_time: datetime = ""
    reason: str = ""
    full_name: str = ""
    gender: str = ""
    dob: str = ""
    phone_number: str = ""
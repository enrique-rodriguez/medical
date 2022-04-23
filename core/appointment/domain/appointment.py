from core.shared.domain import Entity


class Appointment(Entity):
    def __init__(self, provider_id, start_time, end_time, reason, full_name, gender, dob, phone_number, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dob = dob
        self.gender = gender
        self.reason = reason
        self.end_time = end_time
        self.full_name = full_name
        self.start_time = start_time
        self.provider_id = provider_id
        self.phone_number = phone_number

    @classmethod
    def create(cls, data):
        return cls(**data)

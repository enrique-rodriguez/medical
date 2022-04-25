from datetime import datetime
from .appointment import Appointment


class AppointmentFactory:

    @staticmethod
    def create(data):
        tz = data.get('start_time').tzinfo
        
        is_old_start_time = data.get("start_time") <= datetime.now(tz)
        is_old_end_time = data.get("end_time") <= datetime.now(tz)
        is_future_date = data.get("dob") > datetime.today().date()

        if is_old_start_time or is_old_end_time:
            raise ValueError("date must be a future date and time.")
        if is_future_date:
            raise ValueError("Invalid DOB. Must be in the past.")
            
        return Appointment.create(data)
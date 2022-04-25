from unittest import mock
from tests.core.shared import HandlerTestCase
from datetime import datetime, date, timedelta
from core.shared.domain.exceptions import NotFoundError
from core.appointment.application.create_appointment import (
    CreateAppointmentHandler,
    CreateAppointmentCommand,
)


class TestCreateAppointmentHandler(HandlerTestCase):

    def setUp(self):
        self.provider_db = mock.Mock()
        self.appointment_db = mock.Mock()
        self.appointment_factory = mock.Mock()
        self.handler = CreateAppointmentHandler(
            provider_db=self.provider_db, 
            appointment_db=self.appointment_db,
            appointment_factory=self.appointment_factory
        )
    
    def create_command(self, **kwargs):
        start_time = kwargs.pop("start_time", datetime.now()+timedelta(days=5))
        end_time = kwargs.pop("end_time", datetime.now()+timedelta(days=5))
        dob = kwargs.pop("dob", date(2000, 12, 12))
        
        return CreateAppointmentCommand(
            dob=dob,
            end_time=end_time,
            start_time=start_time,
        )

    def test_raises_error_when_provider_is_not_found(self):
        self.provider_db.find.return_value = None
        with self.assertRaises(NotFoundError):
            self.handler(self.create_command())

    def test_start_time_in_the_past_gives_error(self):
        self.handler.set_appointment_factory(None)
        command = self.create_command(start_time=datetime.now()-timedelta(days=1))
        expected_error = "date must be a future date and time."

        self.assertHandlerRaises(self.handler, command, expected_error)
    
    def test_end_time_in_the_past_gives_error(self):
        self.handler.set_appointment_factory(None)
        command = self.create_command(end_time=datetime.now()-timedelta(days=2))
        expected_error = "date must be a future date and time."

        self.assertHandlerRaises(self.handler, command, expected_error)
    
    def test_dob_in_the_future_gives_error(self):
        self.handler.set_appointment_factory(None)
        command = self.create_command(dob=( datetime.now()+timedelta(days=2) ).date())
        expected_error = "Invalid DOB. Must be in the past."

        self.assertHandlerRaises(self.handler, command, expected_error)
    
    def test_saves_appointment_in_the_database(self):
        command = self.create_command()
        mock_appointment = mock.Mock()
        self.appointment_factory.create.return_value = mock_appointment

        self.handler.handle(command)

        self.appointment_db.save.assert_called_with(mock_appointment)
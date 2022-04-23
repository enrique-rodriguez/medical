from django.test import TestCase
from unittest import mock
from django.http import HttpRequest
from api.utils import create_restframework_view


@mock.patch('api.utils.logging')
class TestCreateRestframeworkView(TestCase):

    def setUp(self):
        self.mock_controller = mock.Mock()
        self.mock_controller.method = "POST"
        self.view = create_restframework_view(
            controller=self.mock_controller
        )

    def test_unhandle_exception_gives_500_error(self, mock_logging):
        self.mock_controller.dispatch.side_effect = TypeError

        request = HttpRequest()
        request.method = "POST"

        response = self.view(request)

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data, { 'msg': 'Unexpected error'})
        mock_logging.exception.assert_called_with("Unexpected error")
    

    def test_status_and_response_data_taken_from_controller(self, mock_logging):
        self.mock_controller.status_code = 200
        self.mock_controller.response_data = { 'msg': 'response-data' }

        request = HttpRequest()
        request.method = "POST"

        response = self.view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, { 'msg': 'response-data' })

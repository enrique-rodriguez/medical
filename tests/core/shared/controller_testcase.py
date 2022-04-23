from unittest import TestCase


class ControllerTestCases(TestCase):
    
    def assertStatusCode(self, controller, status_code):
        self.assertEqual(controller.status_code, status_code)
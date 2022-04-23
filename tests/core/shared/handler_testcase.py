from unittest import TestCase


class HandlerTestCase(TestCase):
    
    def assertHandlerRaises(self, handler, command, expected_error):
        try:
            handler(command)
        except Exception as error:
            self.assertEqual(str(error), expected_error)
    
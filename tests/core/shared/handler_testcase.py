from unittest import TestCase
from core import command_bus, query_bus



class HandlerTestCase(TestCase):

    def assertCommandRegistered(self, handler):
        self.assertTrue(command_bus.is_registered(handler))
    
    def assertQueryRegistered(self, handler):
        self.assertTrue(query_bus.is_registered(handler))
    
    def assertHandlerRaises(self, handler, command, expected_error):
        try:
            handler(command)
        except Exception as error:
            self.assertEqual(str(error), expected_error)
    
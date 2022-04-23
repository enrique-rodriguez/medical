from core.appointment import controllers
from api.utils import create_restframework_view
from api.serializers import AppointmentModelSerializer


create = create_restframework_view(
    serializer=AppointmentModelSerializer,
    controller=controllers.create_appointment_controller, 
)

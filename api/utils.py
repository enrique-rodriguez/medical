import logging
from rest_framework.response import Response
from rest_framework.decorators import api_view
from core.shared.controllers import HttpRequest
from core.shared.controllers import Controller


def build_request(request, serializer_class=None):
    query = { k:v for k,v in request.query_params.items() }
    body = { k:v for k,v in request.data.items() }

    if serializer_class:
        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data
        
    return HttpRequest(body=body, query=query)



def create_restframework_view(controller: Controller, serializer=None):
    @api_view(http_method_names=[controller.method])
    def view(request, *args, **kwargs):
        req = build_request(request, serializer)
        try:
            controller.dispatch(req)
            status, data = controller.status_code, controller.response_data
        except:
            logging.exception("Unexpected error")
            status, data = 500, { "msg": 'Unexpected error'}
        return Response(status=status, data=data)
    return view
import os
from django.conf import settings
from whitenoise import WhiteNoise
from django.core.wsgi import get_wsgi_application


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical.settings')

application = WhiteNoise(get_wsgi_application(), root=settings.STATIC_ROOT)

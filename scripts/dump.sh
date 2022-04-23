#!/bin/bash

python manage.py dumpdata api \
    --indent 2 > db.fixtures.json
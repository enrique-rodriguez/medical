#!/bin/bash


source ./scripts/global.sh


if [ -f "$env_file" ] && [ -f "$db_file" ]
then
    python manage.py runserver 0.0.0.0:8000
else
    warn "Project isn't setup yet. running setup script.\n"
    pipenv run setup
    pipenv run dev
fi
#!/bin/bash

# Run tests using coverage for test coverage report.

coverage run manage.py test
coverage html
open htmlcov/index.html > /dev/null 2>&1 &
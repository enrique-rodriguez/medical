# Medical Marketplace

This project consists of building a prototype version of a Medical Provider Marketplace where people can find a doctor or other healthcare providers to book an appointment with.


## Tech Stack

Django (backend)

Svelte (frontend)

HTTP REST

Django ORM (Database) using Postgres

Domain Driven Design (Architecture Patterns)


## Requirements

[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

[Python 3.9](https://www.python.org/downloads/)

[Pipenv](https://pipenv.pypa.io/)

[Node JS](https://nodejs.org/)

## Installation

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/enrique-rodriguez/medical/master/install/install.sh)"
```

Paste that in a macOS Terminal or Linux shell prompt.

## Usage

```bash
cd medical
pipenv run start
```

open [http://localhost:8000](http://localhost:8000) on your web browser of choice.

### Admin Login

if you installed this project using the bash script above, you can login to the admin page using the user created with username "admin" and password "adminpass"

## Running the tests

```bash
pipenv run test
```


## Generate coverage report

```bash
pipenv run coverage
```


## Acknowledgements
[BrainHi-Software-Engineer-Interview-Project](https://www.notion.so/brainhi/BrainHi-Software-Engineer-Interview-Project-c973a3794852449a818c82b4b6c9e714)

[Medilab HTML Template](https://bootstrapmade.com/medilab-free-medical-bootstrap-theme/) from [Bootstrap Made](https://bootstrapmade.com)
#!/bin/bash

readonly env_file="$(pwd)/.env"
readonly db_file="$(pwd)/db.sqlite3"

RED="\e[31m"

warn() {
    printf "\e[30;43m$1\e[0m"
}

abort() {
    printf "$RED$1\e[0m"
    exit
}
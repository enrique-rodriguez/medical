#!/bin/bash


source ./scripts/global.sh


readonly files="$db_file $env_file"

read -p "Are you sure? N/y " clean
pat="[yY]"

if [[ "$clean" =~ $pat ]]
then
    echo "Cleaning..."
else
    echo "Aborting..."
    exit
fi

for f in $files
do
    if [ -f "$f" ]
    then
        rm "$f"
    fi
done
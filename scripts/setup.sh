#!/bin/bash


source ./scripts/global.sh


readonly test_username="admin"
readonly test_user_password="adminpass"
readonly fixtures_files="$(pwd)/db.fixtures.json"


create_user(){
    show "🙋 Creating test user with username '$1' and password '$2'"

    python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('$1', 'admin@example.com', '$2')"
}

show() {
    printf "⌛ $1...\n"
}

create_env_file() {
    if [ ! -f "$1" ]
    then
        show "📁 Creating environment file at $1"
        
        cat "$1.example" > "$1"

        show "🔑 Creating secret key..."
        
        SECRET_KEY="$(python manage.py shell -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
        
        echo "DJANGO_SECRET_KEY=$SECRET_KEY" >> $1
    fi
}

create_database() {
    if [ ! -f "$1" ]
    then
        show "💾 Creating database file at $1"

        show "🗄️  Creating db migrations"

        python3 manage.py makemigrations > /dev/null 2>&1

        show "💽 Applying db migrations..."

        python3 manage.py migrate --no-input > /dev/null 2>&1

        if [ -f "$2" ]
        then
            show "🗃️  Loading db fixtures at $2"
            python manage.py loaddata "$2" > /dev/null 2>&1
        fi
    fi
}

setup() {
    if [ -f "$env_file" ] && [ -f "$db_file" ]
    then
        abort "Project is already setup. run 'pipenv run dev' to  start the development server.\n"
        exit
    fi

    show "🖊️  Setting up project..."
    create_env_file "$env_file"
    create_database "$db_file" "$fixtures_files"
    create_user "$test_username" "$test_user_password"
    printf "✅ Done. Run 'pipenv run dev' to start development server.\n"
}


setup
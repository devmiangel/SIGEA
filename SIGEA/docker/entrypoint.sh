#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    python manage.py seed
    python manage.py seed_permisos
fi

exec "$@"

echo 'starting application'
export FLASK_APP=manage.py
flask db upgrade
gunicorn -b :5000 'formsflow_api:create_app()' --timeout 600 --worker-class=gthread --workers=5 --threads=10

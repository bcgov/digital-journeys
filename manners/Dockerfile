# Use an appropriate base image
FROM python:3.10-alpine


WORKDIR /app
COPY . /app

# Install other project dependencies
RUN pip install -r requirements.txt

USER 1001

EXPOSE 5005

# Use exec form with shell to allow env var substitution
ENTRYPOINT ["/bin/sh", "-c", "gunicorn app:controller --workers=2 --reload -b 0.0.0.0:${FLASK_PORT}"]

#oc new-build --name=digital-journeys-content-sanitiser --binary --strategy=docker
#oc start-build  digital-journeys-content-sanitiser --from-dir=. --follow  
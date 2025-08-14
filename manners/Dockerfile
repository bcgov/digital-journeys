# Use an appropriate base image
FROM python:3.13-alpine


WORKDIR /app
COPY . /app

# Install other project dependencies

RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_lg

USER 1001

EXPOSE 5005

# Use exec form with shell to allow env var substitution
ENTRYPOINT ["/bin/sh", "-c", "gunicorn app:controller --workers=${FLASK_WORKERS:-2} -b 0.0.0.0:${FLASK_PORT}"]
#ENTRYPOINT ["python3", "app.py"]

#oc new-build --name=digital-journeys-content-sanitiser --binary --strategy=docker
#oc start-build  digital-journeys-content-sanitiser --from-dir=. --follow  
#sh start-build.sh
FROM artifacts.developer.gov.bc.ca/docker-remote/python:3.9-slim-buster

WORKDIR /forms-flow-api/app

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install -y git && apt-get install lsyncd -y

COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-api/app
RUN pip install -e .

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 5000
COPY wait-for-service.sh /wait-for-service.sh
RUN chmod u+x /wait-for-service.sh
RUN chmod u+x ./entrypoint.dev
CMD ["/bin/sh", "-c", "lsyncd lsyncd.conf && /bin/sh entrypoint.dev"]

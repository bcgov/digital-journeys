FROM python:3.12-bullseye

WORKDIR /forms-flow-api/app

# Fix APT signature issues on Bookworm
RUN rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
         ca-certificates gnupg debian-archive-keyring \
    && apt-get install -y --no-install-recommends \
        git 

RUN apt-get install -y lsyncd python3-setuptools 

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

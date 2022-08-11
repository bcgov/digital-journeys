# Used as a reference for any custom logic to be done.
# if the application is built from a source repo other than aot , use the custom copying.
# steps : checkout the aot source code and use the copy logic.
# -----------------------------------------------------------
FROM python:3.8-slim-bullseye

RUN apt-get update \
    && apt-get install -y git && apt-get install lsyncd -y
#TODO: REMOVE PULL ON BUILD
ARG FORMIO_SOURCE_REPO_BRANCH
ARG FORMIO_SOURCE_REPO_URL

RUN git clone -b ${FORMIO_SOURCE_REPO_BRANCH} ${FORMIO_SOURCE_REPO_URL} /api/

WORKDIR /forms-flow-api/app
RUN cp /api/forms-flow-api/requirements.txt /forms-flow-api/app
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

RUN cp -r /api/forms-flow-api/* /forms-flow-api/app
COPY . /digital-journeys
RUN cp -r /digital-journeys/* /forms-flow-api/app

RUN pip install -e .

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 5000
RUN chmod u+x ./entrypoint.dev

CMD ["/bin/sh", "-c", "lsyncd lsyncd.conf && /bin/sh entrypoint.dev"]

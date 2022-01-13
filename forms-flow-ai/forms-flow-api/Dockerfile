FROM python:3.8

RUN git clone -b ${FORMIO_SOURCE_REPO_BRANCH} ${FORMIO_SOURCE_REPO_URL} /api/
WORKDIR /forms-flow-api/app
RUN cp -r /api/forms-flow-api/* /forms-flow-api/app

ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-api/app

RUN pip install .

EXPOSE 5000

RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
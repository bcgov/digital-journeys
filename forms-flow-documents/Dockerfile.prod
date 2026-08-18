# PB Using purpose built Selenium image for forms-flow-documents
FROM selenium/standalone-chromium:136.0

USER root

WORKDIR /forms-flow-documents/app

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install -y gnupg2 \
  && apt-get install -y curl \
  && apt-get install -y unzip \
  && apt-get install -y git \
  && apt-get install lsyncd -y \
  && apt-get install wget -y \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-documents/app
RUN pip install -e .

COPY ./lsyncd.conf lsyncd.conf

# PB Modified pdf.py from _utils to work with latest selenium version
COPY ./rootfs/pdf.py /venv/lib/python3.12/site-packages/formsflow_api_utils/utils/pdf.py

EXPOSE 5006
RUN chmod u+x ./entrypoint.dev

CMD ["/bin/sh", "-c", "lsyncd lsyncd.conf && /bin/sh entrypoint.dev"]


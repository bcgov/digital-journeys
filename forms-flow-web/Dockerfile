# base image
FROM node:14.20.0-alpine

# set working directory
WORKDIR /app
ARG FORMIO_SOURCE_REPO_BRANCH
ARG FORMIO_SOURCE_REPO_URL

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd

# Clone code
RUN git clone -b ${FORMIO_SOURCE_REPO_BRANCH} ${FORMIO_SOURCE_REPO_URL} /web/

RUN cp -rf /web/forms-flow-web/* /app/
RUN rm /app/public/logo.svg
COPY /public/logo.svg /app/public/

ARG CUSTOM_SRC_DIR=src

# Override these files they have custom changes in the sbc_divapps directory
COPY ./${CUSTOM_SRC_DIR}/  /app/${CUSTOM_SRC_DIR}/

ARG CUSTOM_SVG_DIR=public/webfonts
COPY ./${CUSTOM_SVG_DIR}/ /app/${CUSTOM_SVG_DIR}/

COPY ./package*.json ./

RUN npm install

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 8080:8080

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]


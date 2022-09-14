# base image
FROM node:14.20.0-alpine

# set working directory
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd
COPY /public/logo.svg /app/public/

# ARG CUSTOM_SRC_DIR=src
# ARG FORMS_FLOW_WEB_UTIL_DIR=forms-flow-util
# Override these files they have custom changes in the sbc_divapps directory
# COPY ./${CUSTOM_SRC_DIR}/  /app/${CUSTOM_SRC_DIR}/
# COPY ./${FORMS_FLOW_WEB_UTIL_DIR}/  /app/${FORMS_FLOW_WEB_UTIL_DIR}/

# ARG CUSTOM_SVG_DIR=public/webfonts
COPY ./public/webfonts/ /app/public/webfonts/

COPY ./package*.json ./

RUN npm install

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 8080:8080

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]


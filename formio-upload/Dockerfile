FROM node:12-alpine
MAINTAINER Form.io <support@form.io>

COPY ./ /src
WORKDIR /src

# Install git
RUN apk update && \
    apk upgrade && \
    apk add --no-cache --virtual .build-deps bash git make gcc g++ python

RUN npm cache clean --force && \
    npm install && \
    npm uninstall -g npm && \
    apk del .build-deps

EXPOSE      80
ENTRYPOINT  ["node", "index"]

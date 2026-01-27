# base image
FROM node:24.13.0-alpine3.23

# set working directory
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd

# install and cache app dependencies

COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json

# TODO: fix peer dependency issues
RUN npm install --legacy-peer-deps
COPY . /app/

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 8080:8080

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]


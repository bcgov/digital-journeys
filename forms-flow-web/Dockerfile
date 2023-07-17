# base image
FROM node:14.21.2-alpine

# set working directory
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd

# install and cache app dependencies

# COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json

RUN npm install

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 8080:8080

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]


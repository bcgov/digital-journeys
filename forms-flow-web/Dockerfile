# base image
FROM node:14.21.2-alpine

# set working directory
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd

# install and cache app dependencies

COPY package-lock.txt /app/package-lock.json
COPY package.json /app/package.json

RUN npm install
COPY . /app/

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 3000:3000

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]

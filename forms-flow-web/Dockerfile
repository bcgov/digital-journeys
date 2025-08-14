# base image
FROM node:24-alpine

# set working directory
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh lsyncd python3 make g++    

# install and cache app dependencies

COPY package-lock.txt /app/package-lock.json
COPY package.json /app/package.json


RUN npm install --legacy-peer-deps 
COPY . /app/

COPY ./lsyncd.conf lsyncd.conf

EXPOSE 3003:3000

RUN ls

CMD ["/bin/bash", "-c", "lsyncd lsyncd.conf; npm start"]

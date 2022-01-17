# base image
FROM node:12.4.0-alpine as build-stage

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

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

RUN npm install
RUN npm run build

FROM nginx:1.17 as production-stage
RUN mkdir /app
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080:8080
CMD ["nginx", "-g", "daemon off;"]
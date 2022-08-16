FROM node:16.16.0-alpine
MAINTAINER Form.io <support@form.io>

COPY ./ /src
WORKDIR /src

# Install dependencies required
# for puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      rsync \
      grsync \
      tar

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install


EXPOSE      80
ENTRYPOINT  ["node", "index"]

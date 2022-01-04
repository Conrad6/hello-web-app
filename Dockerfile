FROM node:17.3.0-alpine3.15

WORKDIR /app

COPY package.json /app

RUN /bin/sh -c npm install

COPY . /app

EXPOSE ${SERVER_PORT}

CMD [ "node" "index.mjs" ]
FROM node:8-alpine

WORKDIR /app
ADD . .

RUN npm install

ENTRYPOINT ["node", "check"]

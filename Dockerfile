FROM node:16-slim

WORKDIR /app

COPY /public .

ENV NODE_ENV="production"
ENV PORT=8080

ENTRYPOINT [ "node", "server.js" ]

FROM node:16-alpine
RUN mkdir -p /home/node/app/node_modules && mkdir -p /home/node/app/dist && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY . .
USER node
RUN npm ci
RUN npm run build
COPY --chown=node:node . .

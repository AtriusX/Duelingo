FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
COPY .env.production .env

RUN yarn migratedb
RUN yarn build

ENV NODE_ENV production

EXPOSE 3000:3000
CMD ["node", "dist/index.js"]
USER root
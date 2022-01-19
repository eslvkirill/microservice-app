FROM node:16-alpine

WORKDIR /src

COPY package.json yarn.lock nodemon.json ./

RUN yarn

COPY . .

CMD ["yarn", "dev"]
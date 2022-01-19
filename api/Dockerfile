FROM node:16-alpine

WORKDIR /src

COPY package.json yarn.lock nodemon.json ./

RUN yarn

COPY . .

EXPOSE 3001

CMD ["yarn", "dev"]
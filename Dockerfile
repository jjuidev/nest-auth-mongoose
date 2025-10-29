FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY . .
RUN yarn install

FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --omit=dev

FROM node:20-alpine AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY ./package.json .
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/dist /app/dist
CMD ["yarn", "start"]
EXPOSE 3000

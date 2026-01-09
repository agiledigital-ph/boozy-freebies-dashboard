FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY . .
RUN pnpm install -r -prod

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]
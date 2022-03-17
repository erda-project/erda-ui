#!dice
FROM registry.erda.cloud/retag/node:14.18.2-bullseye-slim

# Set special timezone
RUN echo "Asia/Shanghai" | tee /etc/timezone

WORKDIR /usr/src/app

COPY public  ./public
COPY scheduler ./scheduler

WORKDIR /usr/src/app/scheduler
ENV NODE_ENV=production

RUN npm i pnpm -g
RUN pnpm i --unsafe-perm --reporter append-only
RUN npm run build

CMD npm run start:prod

FROM registry.erda.cloud/erda-x/node:14

WORKDIR /usr/src/app

COPY public  ./public
COPY scheduler ./scheduler

WORKDIR /usr/src/app/scheduler
ENV NODE_ENV=production

RUN npm i pnpm@6.x -g
RUN pnpm i --unsafe-perm --reporter append-only
RUN pnpm run build

CMD pnpm run start:prod

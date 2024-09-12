# syntax = registry.erda.cloud/retag/dockerfile:latest
FROM registry.erda.cloud/erda-x/node:14 as build

WORKDIR /build

COPY . ./erda-ui
COPY --from=erda-ui-enterprise / /build/erda-ui-enterprise

RUN cd erda-ui/shell && \
    npm run extra-logic && \
    cd /build/erda-ui && \
    npm cache clean --force && \
    npm install -g --force pnpm@6.x && \
    pnpm install --frozen-lockfile --no-optional --unsafe-perm && \
    pnpm run build-online

FROM registry.erda.cloud/erda-x/node:14

WORKDIR /usr/src/app

COPY --from=build /build/erda-ui/public ./public
COPY --from=build /build/erda-ui/scheduler ./scheduler

WORKDIR /usr/src/app/scheduler

ENV NODE_ENV=production

RUN npm install -g pnpm@6.x && \
    pnpm install --unsafe-perm --reporter append-only && \
    pnpm run build

CMD ["pnpm", "run", "start:prod"]

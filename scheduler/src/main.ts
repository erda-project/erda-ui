// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import fs from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './not-found-filter';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { log, logWarn, getDirectories, getEnv } from './util';

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../..', `cert/dev/server.key`), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname, '../..', `cert/dev/server.crt`), 'utf8'),
};

const { staticDir, envConfig } = getEnv();
const { MODULES, SCHEDULER_URL, SCHEDULER_PORT, BACKEND_URL } = envConfig;

const modules: { [k: string]: boolean } = {};
getDirectories(staticDir).forEach((m) => {
  modules[m] = true;
});

MODULES.split(',').forEach((m) => {
  if (!modules[m]) {
    logWarn(`module:【${m}】have not build to public`);
  }
});

log(`Exist static modules: ${Object.keys(modules)}`);

let dataEngineerInfo: Partial<{ name: string }> = {};
const modulePath = path.resolve(__dirname, '../../../erda-ui-enterprise');
const children = fs.readdirSync(modulePath, { withFileTypes: true });
for (let i = 0; i < children.length; i++) {
  const child = children[i];
  if (child.isDirectory()) {
    const configPath = path.resolve(modulePath, child.name, 'erda-build-config.js');
    if (fs.existsSync(configPath)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const moduleConfig = require(configPath);
      if (moduleConfig.role === 'DataEngineer') {
        dataEngineerInfo = moduleConfig;
        break;
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.use(
    '/api/**/websocket',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      ws: true,
    }),
  );
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('referer', BACKEND_URL);
      },
    }),
  );
  app.use(
    `/${dataEngineerInfo.name}-app/`,
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
    }),
  );

  await app.listen(SCHEDULER_PORT);

  log(`server started at ${SCHEDULER_URL}:${SCHEDULER_PORT}`);
}

bootstrap();

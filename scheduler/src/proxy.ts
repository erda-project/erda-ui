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

import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request } from 'express';
import { getEnv, logger } from './util';
import { INestApplication } from '@nestjs/common';

const isProd = process.env.NODE_ENV === 'production';

const { envConfig, dataAppName } = getEnv();
const { BACKEND_URL, GITTAR_ADDR } = envConfig;

const API_URL = BACKEND_URL.startsWith('http') ? BACKEND_URL : `http://${BACKEND_URL}`;
let gittarUrl = isProd ? GITTAR_ADDR : BACKEND_URL;
gittarUrl = gittarUrl.startsWith('http') ? gittarUrl : `http://${gittarUrl}`;

const wsPathRegex = [
  /^\/api\/[^/]*\/websocket/,
  RegExp(`^/api/[^/]*/${dataAppName}-websocket`), // http-proxy-middleware can't handle multiple ws proxy https://github.com/chimurai/http-proxy-middleware/issues/463
  /^\/api\/[^/]*\/terminal/,
  /^\/api\/[^/]*\/apim-ws\/api-docs\/filetree/,
];

export const createProxyService = (app: INestApplication) => {
  const wsProxy = createProxyMiddleware(
    (pathname: string) => {
      return wsPathRegex.some((regex) => regex.test(pathname));
    },
    {
      target: API_URL,
      ws: true,
      changeOrigin: !isProd,
      xfwd: true,
      secure: false,
      pathRewrite: replaceApiOrgPath,
      onProxyReqWs: (proxyReq, req: Request, socket) => {
        const uri = req.headers['x-original-uri'];
        if (uri && typeof uri === 'string') {
          const org = uri.split('/')?.[2];
          proxyReq.setHeader('org', org);
        } else {
          proxyReq.setHeader('org', 'terminus');
        }

        proxyReq.setHeader('Sec-WebSocket-Protocol', 'base64.channel.k8s.io');

        socket.on('error', (error) => {
          logger.warn('Websocket error:', error); // add error handler to prevent server crash https://github.com/chimurai/http-proxy-middleware/issues/463#issuecomment-676630189
        });
      },
    },
  );
  app.use(wsProxy);
  app.use(
    createProxyMiddleware(
      (pathname: string) => {
        return pathname.match('^/api') && pathname !== '/api/dice-env';
      },
      {
        target: API_URL,
        changeOrigin: !isProd,
        xfwd: true,
        secure: false,
        pathRewrite: replaceApiOrgPath,
        onProxyReq: (proxyReq, req: Request) => {
          if (!isProd) {
            proxyReq.setHeader('referer', API_URL);
          } else {
            proxyReq.setHeader('org', extractOrg(req.originalUrl));
          }
        },
      },
    ),
  );
  let dataServiceUIAddr = isProd ? process.env[`${dataAppName.toUpperCase()}_UI_ADDR`] : API_URL;
  dataServiceUIAddr = dataServiceUIAddr.startsWith('http') ? dataServiceUIAddr : `http://${dataServiceUIAddr}`;
  app.use(
    `/${dataAppName}-app/`,
    createProxyMiddleware({
      target: `${dataServiceUIAddr}/`,
      changeOrigin: !isProd,
      pathRewrite: (p: string, req: Request) => {
        if (p === `/${dataAppName}-app/static/menu.json`) {
          const lang = req.headers.lang || 'zh-CN';
          return `/${dataAppName}-app/static/menu-${lang === 'zh-CN' ? 'zh' : 'en'}.json`;
        }
        return p;
      },
    }),
  );
  app.use(
    createProxyMiddleware(
      (pathname: string, req: Request) => {
        const userAgent = req.headers['user-agent'];
        if (userAgent.includes('git')) {
          return /[^/]*\/dop/.test(pathname);
        }
        return false;
      },
      {
        target: gittarUrl,
        changeOrigin: !isProd,
      },
    ),
  );
  app.use(
    '/metadata.json',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: !isProd,
    }),
  );
  return wsProxy;
};

const replaceApiOrgPath = (p: string) => {
  if (isProd) {
    const match = /\/api\/([^/]*)\/(.*)/.exec(p); // /api/orgName/path => /api/path
    if (match && !p.startsWith('/api/files')) {
      return `/api/${match[2]}`;
    }
  }
  return p;
};

const extractOrg = (p: string) => {
  const match = /^\/[^/]*\/([^/]*)\/?/.exec(p);
  if (match && !p.startsWith('/api/files')) {
    return match[1];
  }
  return '';
};

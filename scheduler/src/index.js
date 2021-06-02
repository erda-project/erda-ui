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

const path = require('path');
const fs = require('fs');
const send = require('koa-send');
const c2k = require('koa2-connect')
const DevServer = require('koa-devserver');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { log, logWarn, getDirectories, getEnv } = require('./util');


const { erdaRoot, staticDir, envConfig } = getEnv();
const { MODULES, SCHEDULER_URL, SCHEDULER_PORT, BACKEND_URL, MARKET_DIR } = envConfig;
const [SCHEDULER_PROTOCOL, SCHEDULER_DOMAIN] = SCHEDULER_URL.split('://');

const prodModules = {};
getDirectories(staticDir).forEach(m => {
  prodModules[m] = true;
});
MODULES.split(',').forEach(m => {
  if (!prodModules[m]) {
    logWarn(`module:【${m}】have not build to public`);
  }
})

log(`Exist static modules: ${Object.keys(prodModules)}

Please add follow config to your /etc/hosts file:
127.0.0.1   dice.dev.terminus.io
`);

const staticFileMiddleware = async (ctx) => {
  const [_empty, scope, moduleName, ...rest] = ctx.path.split('/');
  const match = /^\/[a-zA-Z-_]+\/market(.*)/.exec(ctx.path);
  if (match) { // /{org}/market/xx -> market module
    return !match[1]
      ? send(ctx, 'index.html', { root: `${MARKET_DIR}/dist` })
      : send(ctx, rest.join('/'), { root: `${MARKET_DIR}/dist` });
  }
  if (scope === 'static') { // prod modules
    if (prodModules[moduleName]) {
      return send(ctx, ctx.path, { root: `${erdaRoot}/public` });
    } else {
      return ctx.body = `module【${moduleName}】is not build`
    }
  }
  return send(ctx, 'index.html', { root: `${staticDir}/shell` });
};


const server = new DevServer({
  name: 'Erda-UI',
  root: staticDir, // the web root - or ["path/to/root1", "path/to/root2"] for multiple web roots
  host: SCHEDULER_DOMAIN, // the host to listen to
  port: SCHEDULER_PORT, // the port to listen to
  open: `${staticDir}/shell/index.html`,
  index: `${staticDir}/shell/index.html`, // use an index file when GET directory -> passed to koa-send
  // verbose: true, // if true print HTTP requests
  https: { // defaults to undefined
    key: fs.readFileSync(`${erdaRoot}/cert/dev/server.key`, 'utf8'),
    cert: fs.readFileSync(`${erdaRoot}/cert/dev/server.crt`, 'utf8')
  },
  // livereload: { // can be a string an array or an object. defaults to undefined.
  //   // any livereload option
  //   // plus:
  //   // watch: ["/Users/Jun/workspace/erda-ui-enterprise/admin/dist"], // or an array of paths, regexs or globs
  //   // port: 35729, // use a custom livereload port
  //   // src: 'http://127.0.0.1:35729/livereload.js?snipver=1', // use a custom livereload script src
  //   // errorPage: '/fs/path/to/error_page_template.html' // use a custom error page template
  // },
  use: [ // can inject one or more koa middleware in the request execution stack
    c2k(createProxyMiddleware('/api/\w+/websocket', { target: BACKEND_URL, changeOrigin: true, ws: true })),
    c2k(createProxyMiddleware('/api', { target: BACKEND_URL, changeOrigin: true })),
    staticFileMiddleware,
  ]
});

server.start();

log(`listen at ${SCHEDULER_URL}:${SCHEDULER_PORT}`);

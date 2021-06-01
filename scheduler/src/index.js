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

const root = path.resolve(process.cwd(), '..');
const staticDir = `${root}/public/static`;


const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const prodModules = {};
getDirectories(staticDir).forEach(m => {
  prodModules[m] = true;
});
console.log('exist modules:', Object.keys(prodModules));


const redirectMiddleware = async (ctx) => {
  const [empty, scope, moduleName, ...rest] = ctx.path.split('/');
  if (scope === 'static') { // prod modules
    if (prodModules[moduleName]) {
      return send(ctx, ctx.path, { root: `${root}/public` });
    } else {
      return ctx.body = `module【${moduleName}】is not build`
    }
  }
  return send(ctx, 'index.html', { root: `${staticDir}/shell` });
};

const server = new DevServer({
  name: 'Erda',
  root: staticDir, // the web root - or ["path/to/root1", "path/to/root2"] for multiple web roots
  host: 'dice.dev.terminus.io', // the host to listen to
  port: 3000, // the port to listen to
  open: `${staticDir}/shell/index.html`,
  index: `${staticDir}/shell/index.html`, // use an index file when GET directory -> passed to koa-send
  // verbose: true, // if true print HTTP requests
  https: { // defaults to undefined
    key: fs.readFileSync(`${root}/cert/dev/server.key`, 'utf8'),
    cert: fs.readFileSync(`${root}/cert/dev/server.crt`, 'utf8')
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
    c2k(createProxyMiddleware('/api', { target: 'https://terminus-org.dev.terminus.io', changeOrigin: true })),
    redirectMiddleware,
  ]
});

server.start();

console.log(`listen at https://dice.dev.terminus.io:3000`);

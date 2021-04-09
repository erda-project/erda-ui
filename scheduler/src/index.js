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
const root = path.resolve(process.cwd(), '..');
const { parsed: config } = require('dotenv').config({ path: `${root}/.env` })
const Koa = require('koa');
const send = require('koa-send');

if (!config) {
  throw Error(`cannot find .env file in directory: ${root}`);
}
console.log('=============== start with env config ====================');
console.log(config);

const app = new Koa();

const modules = config.DEV_MODULES.split(',');
const moduleUrl = {};
const redirectList = [];
modules.forEach(moduleKey => {
  const MODULE_KEY = moduleKey.toUpperCase();
  const redirectUrl = config[`${MODULE_KEY}_URL`];
  moduleUrl[moduleKey.toLowerCase()] = redirectUrl;
  redirectList.push(`/${moduleKey}/* => ${redirectUrl}`)
})
console.log('=============== redirect map ====================');
console.log(redirectList);


app.use(async ctx => {
  const moduleName = ctx.path.split('/')[1];
  if (moduleUrl[moduleName]) {
    return ctx.redirect(`${moduleUrl[moduleName]}${ctx.path.slice(moduleName.length + 1)}`);
  }
  if (ctx.path === '/') {
    ctx.body = 'Scheduler is running'
  }
  // prod mode
  await send(ctx, ctx.path, { root: `${root}/public/static` });
});

app.listen(3000);

console.log(`listen at ${3000}`);

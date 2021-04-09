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

const defaultConfig = {
  userName: Cypress.env('username'),
  password: Cypress.env('password'),
  url: Cypress.config('baseUrl'),
};

const loginUrlMap = {
  dev: 'https://uc.dev.terminus.io/api/user/web/login/identify',
  test: 'https://uc.test.terminus.io/api/user/web/login/identify',
  app: 'https://uc.terminus.io/api/user/web/login/identify',
};

const reg = /https?:\/\/[a-zA-Z0-9-_]+.(?<env>\S+).terminus.io/;

const { env } = defaultConfig.url.match(reg).groups || {};

/**
 * @description login without ui
 * @see https://yuque.antfin.com/terminus_paas_dev/front/xfk4zg#XhhKW
 * @example cy.loginWithoutUI({ url: '/workBench/projects' });
 */
Cypress.Commands.add('loginWithoutUI', ({
  userName = defaultConfig.userName,
  password = defaultConfig.password,
  url = defaultConfig.url,
} = {}) => {
  cy.request({
    url: loginUrlMap[env],
    method: 'post',
    body: {
      identify: userName,
      password,
      remember: true,
    },
  }).should(res => {
    cy.log(JSON.stringify(res.body));
    expect(res.body.success).to.eq(true);
    Cypress.Cookies.defaults({
      preserve: ['OPENAPISESSION', 'OPENAPI-CSRF-TOKEN', 'taid'],
    });
    cy.visit(url);
  });
});

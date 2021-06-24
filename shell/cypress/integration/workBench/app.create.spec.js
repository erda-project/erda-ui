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

import { genRandomEnText, genRandomCnText } from '../../utils';

const repoType = {
  inner: '系统内置Git仓库',
  outer: '外置通用Git仓库',
};
const typeBaseInfo = (index, name) => {
  cy.get(`.app-type-select > :nth-child(${index})`).click();
  cy.get('#name').type(name);
  cy.get('#desc').type(genRandomCnText(20));
  cy.get('span.ant-upload > :nth-child(1)').upload('./google.png');
};
const repoTest = (type) => {
  cy.get('[id="repoConfig.type"]').selectHack(type);
  if (type === repoType.outer) {
    // id 中包含(.), 使用属性选择器
    cy.get('[id="repoConfig.url"]').type('https://github.com/KabaLabs/Cypress-Recorder');
    cy.get('[id="repoConfig.username"]').type(Cypress.env('username'));
    cy.get('[id="repoConfig.password"]').type(Cypress.env('password'));
    cy.get('[id="repoConfig.desc"]').type('1');
  }
};
const baseAssertion = (name) => {
  cy.server();
  cy.route('POST', '/api/applications').as('createApp');
  // cy.contains('保 存').click();
  // cy.waitResponse('@createApp');
};

describe('dop-apps-create', () => {
  before(() => {
    cy.loginWithoutUI({ url: `/dop/projects/${Cypress.env('projectID')}/apps/createApp` });
  });
  it('create business app ', () => {
    typeBaseInfo(1, genRandomEnText(10));
    repoTest(repoType.outer);
    baseAssertion('Business_APP');
  });
  it.skip('create mobile app without template', () => {
    typeBaseInfo(2, genRandomEnText(10));
    cy.get('#template').selectHack('无');
    baseAssertion();
  });
  it.skip('create mobile app with template', () => {
    typeBaseInfo(2, 'cy_mobile_APP_with_template');
    cy.get('#template').selectHack('terminusMobileTemplates');
    cy.get('#mobileDisplayName').type('WeChat');
    cy.get('#bundleID').type('com.terminus.demos');
    cy.get('#packageName').type('com.terminus.demo');

    baseAssertion('mobile_APP_wit_template');
  });
});

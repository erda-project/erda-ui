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

import { genRandomCnText, genRandomEnText } from '../../utils';

const projectName = genRandomEnText(10);
/**
 * 创建项目
 * @param checked {boolean}
 */
const createProject = (checked) => {
  cy.get('.top-button-group .ant-btn-primary').click();
  cy.get('#displayName').type(projectName);
  cy.get('#name').should(($el) => {
    expect($el.get(0)).to.have.property('value', projectName);
  });
  if (checked) {
    cy.contains('需要配置项目集群资源').find('input').check();
    cy.get('[id="clusterConfig.DEV"]').selectHack('terminus-test');
    cy.get('[id="clusterConfig.TEST"]').selectHack('terminus-test');
    cy.get('[id="clusterConfig.STAGING"]').selectHack('terminus-test');
    cy.get('[id="clusterConfig.PROD"]').selectHack('terminus-test');
    cy.get('#cpuQuota').type(0.1);
    cy.get('#memQuota').type(0.1);
  } else {
    cy.contains('需要配置项目集群资源').find('input').uncheck();
  }
  cy.get('#desc').type('cypress_project');
  cy.server();
  cy.route('POST', '/api/projects').as('response');
  cy.get('.btn-save').click();
  cy.waitResponse('@response');
};
context('o-apps', () => {
  before(() => {
    cy.loginWithoutUI({ url: '/orgCenter/projects' });
  });
  it('createProject', () => {
    createProject(true);
  });
  it.skip('searchProject ', () => {
    cy.server();
    cy.route('/api/projects*').as('getList');
    cy.visit('/orgCenter/projects');
    cy.wait('@getList');
    cy.get('.ant-input').type(projectName);
    cy.wait('@getList');
    cy.get('.pk-table-row').should('have.length', 1);
    cy.get('.ant-input').clear();
    cy.wait('@getList');
  });
  it.skip('gotoEditProject', () => {
    cy.contains(projectName).click();
    cy.url().should('match', /projects\/\d+\/setting$/);
  });
  it.skip('editProject', () => {
    cy.server();
    cy.get('.ant-btn-primary').click();
    cy.get('#displayName').type(genRandomEnText());
    cy.get('#desc').type(genRandomCnText());
    cy.route('PUT', '/api/projects/*').as('update');
    cy.get('.ant-btn-primary:nth-child(2)').click();
    cy.waitResponse('@update');
  });
  it.skip('deleteProject', () => {
    cy.server();
    cy.get('.delete-danger > .ant-btn').click();
    cy.route('DELETE', '/api/projects/*').as('delete');
    cy.get('.ant-modal-confirm-btns > .ant-btn-primary').click();
    cy.waitResponse('@delete');
  });
});

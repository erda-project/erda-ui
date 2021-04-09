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

/**
 * select
 * @example cy.get('#select').selectHack('123')
 */
Cypress.Commands.add('selectHack', { prevSubject: true }, (selector, label) => {
  cy.get(selector).click().next().contains(label)
    .click();
});
/**
 * upload file
 * @example cy.get('#input[type=file]').selectHack(filePath)
 * filePath its rootPath is fixture
 */
Cypress.Commands.add('upload', { prevSubject: true }, (prevSubject, filePath) => {
  cy.server();
  cy.route('POST', '/api/files').as('uploadFile');
  cy.get(prevSubject).attachFile({ filePath }, { force: true });
  cy.waitResponse('@uploadFile');
});

/**
 * @description 通用请求断言，
 * @param alias {string} cy.router 的别名
 */
Cypress.Commands.add('waitResponse', (alias, code = 200) => {
  cy.wait(alias).then(res => {
    expect(res.status).to.equal(code);
  });
});

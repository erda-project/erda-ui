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
 * @description
 */
Cypress.Commands.add('testList', (url, filterKey = 'displayName') => {
  cy.server();
  cy.route(url).as('getList');
  cy.wait('@getList').its('response.body.data.list').then((list) => {
    if (list[0]) {
      const displayName = list[0][filterKey];
      cy.log(displayName);
      cy.get('.ant-input').type(displayName);
      cy.wait('@getList');
      cy.get('.pk-list > .pk-list-item').should('have.length.at.least', 1);
      cy.get('.ant-input').clear();
      cy.wait('@getList');
    }
  });
});


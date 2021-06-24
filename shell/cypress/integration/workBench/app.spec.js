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

// / <reference types="cypress" />

context('WorkBench-apps', () => {
  before(() => {
    cy.loginWithoutUI({ url: `/dop/projects/${Cypress.env('projectID')}/apps` });
  });
  it('searchProject ', () => {
    cy.testList('/api/applications*');
  });
  it('toggleTop', () => {
    cy.server();
    cy.route('PUT', '/api/applications/*/actions/*').as('toTop');
    cy.get('.pk-list > :nth-child(1) .to-top>span').click({ force: true });
    cy.waitResponse('@toTop');
  });
  it('goToMyAppDetail', () => {
    cy.get('.pk-list > :nth-child(1)').click();
    cy.url().should('match', /\d+\/apps\/\d+/);
  });
});

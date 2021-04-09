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

context.skip('Login', () => {
  beforeEach(() => {
    cy.LOGIN();
  });

  it('goto default page', () => {
    cy.url().should('eq', 'https://terminus-org.test.terminus.io/workBench/apps');
    cy.get('#dice-content')
      .should(($content) => {
        expect($content).to.have.length(1);
      });
  });

  it('search apps in my app list', () => {
    // https://on.cypress.io/url
    // cy.url().should('eq', 'https://terminus-org.test.terminus.io/workBench/apps')
    cy.get('.app-list-section > ul > li').should($lis => {
      expect($lis.length).to.gt(1);
    });
    cy.wait(100);
    cy.get('.ant-input')
      .type('blog');
    cy.get('.app-list-section > ul > li').should($lis => {
      expect($lis.length).to.eq(1);
    });
  });
});

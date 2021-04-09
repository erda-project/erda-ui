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

/// <reference types="cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
    cy.get('.navbar-nav').contains('Commands').click()
    cy.get('.dropdown-menu').contains('Navigation').click()
  })

  it('cy.go() - go back or forward in the browser\'s history', () => {
    // https://on.cypress.io/go

    cy.location('pathname').should('include', 'navigation')

    cy.go('back')
    cy.location('pathname').should('not.include', 'navigation')

    cy.go('forward')
    cy.location('pathname').should('include', 'navigation')

    // clicking back
    cy.go(-1)
    cy.location('pathname').should('not.include', 'navigation')

    // clicking forward
    cy.go(1)
    cy.location('pathname').should('include', 'navigation')
  })

  it('cy.reload() - reload the page', () => {
    // https://on.cypress.io/reload
    cy.reload()

    // reload the page without using the cache
    cy.reload(true)
  })

  it('cy.visit() - visit a remote url', () => {
    // https://on.cypress.io/visit

    // Visit any sub-domain of your current domain

    // Pass options to the visit
    cy.visit('https://example.cypress.io/commands/navigation', {
      timeout: 50000, // increase total time for the visit to resolve
      onBeforeLoad (contentWindow) {
        // contentWindow is the remote page's window object
        expect(typeof contentWindow === 'object').to.be.true
      },
      onLoad (contentWindow) {
        // contentWindow is the remote page's window object
        expect(typeof contentWindow === 'object').to.be.true
      },
    })
    })
})

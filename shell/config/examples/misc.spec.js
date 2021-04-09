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

context('Misc', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/misc')
  })

  it('.end() - end the command chain', () => {
    // https://on.cypress.io/end

    // cy.end is useful when you want to end a chain of commands
    // and force Cypress to re-query from the root element
    cy.get('.misc-table').within(() => {
      // ends the current chain and yields null
      cy.contains('Cheryl').click().end()

      // queries the entire table again
      cy.contains('Charles').click()
    })
  })

  it('cy.exec() - execute a system command', () => {
    // execute a system command.
    // so you can take actions necessary for
    // your test outside the scope of Cypress.
    // https://on.cypress.io/exec

    // we can use Cypress.platform string to
    // select appropriate command
    // https://on.cypress/io/platform
    cy.log(`Platform ${Cypress.platform} architecture ${Cypress.arch}`)

    // on CircleCI Windows build machines we have a failure to run bash shell
    // https://github.com/cypress-io/cypress/issues/5169
    // so skip some of the tests by passing flag "--env circle=true"
    const isCircleOnWindows = Cypress.platform === 'win32' && Cypress.env('circle')

    if (isCircleOnWindows) {
      cy.log('Skipping test on CircleCI')

      return
    }

    // cy.exec problem on Shippable CI
    // https://github.com/cypress-io/cypress/issues/6718
    const isShippable = Cypress.platform === 'linux' && Cypress.env('shippable')

    if (isShippable) {
      cy.log('Skipping test on ShippableCI')

      return
    }

    cy.exec('echo Jane Lane')
      .its('stdout').should('contain', 'Jane Lane')

    if (Cypress.platform === 'win32') {
      cy.exec('print cypress.json')
        .its('stderr').should('be.empty')
    } else {
      cy.exec('cat cypress.json')
        .its('stderr').should('be.empty')

      cy.exec('pwd')
        .its('code').should('eq', 0)
    }
  })

  it('cy.focused() - get the DOM element that has focus', () => {
    // https://on.cypress.io/focused
    cy.get('.misc-form').find('#name').click()
    cy.focused().should('have.id', 'name')

    cy.get('.misc-form').find('#description').click()
    cy.focused().should('have.id', 'description')
  })

  context('Cypress.Screenshot', function () {
    it('cy.screenshot() - take a screenshot', () => {
      // https://on.cypress.io/screenshot
      cy.screenshot('my-image')
    })

    it('Cypress.Screenshot.defaults() - change default config of screenshots', function () {
      Cypress.Screenshot.defaults({
        blackout: ['.foo'],
        capture: 'viewport',
        clip: { x: 0, y: 0, width: 200, height: 200 },
        scale: false,
        disableTimersAndAnimations: true,
        screenshotOnRunFailure: true,
        onBeforeScreenshot () { },
        onAfterScreenshot () { },
      })
    })
  })

  it('cy.wrap() - wrap an object', () => {
    // https://on.cypress.io/wrap
    cy.wrap({ foo: 'bar' })
      .should('have.property', 'foo')
      .and('include', 'bar')
  })
})

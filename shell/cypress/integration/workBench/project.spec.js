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
context('WorkBench-project', () => {
  before(() => {
    cy.loginWithoutUI({ url: '/workBench/projects' });
  });
  it('searchProject ', () => {
    cy.testList('/api/projects/actions/list-my-projects*');
  });
  it('goToMyAppList', () => {
    cy.get(':nth-child(1) > .project-item > .item-container').click();
    cy.url().should('match', /\d+\/apps$/);
  });
});

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

import { Role, test } from '../../fixtures';
import { ProjectManage } from '../pages/project-manage';
import { expect } from '@playwright/test';

const mspProject = {
  type: 'MSP',
  displayName: `auto-msp-${Date.now()}`,
  desc: 'this is a msp project description',
};

Role('Manager', () => {
  test.describe('project manage', () => {
    test.beforeEach(async ({ page, goTo }) => {
      await goTo('orgCreateProject');
      await page.waitForEvent('requestfinished');
    });
    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test('msp project', async ({ page, goTo }) => {
      const projectManage = new ProjectManage(page);
      await projectManage.createProject(mspProject);
      const count = await projectManage.searchProject(mspProject.displayName);
      expect(count).toBe(1);
      await projectManage.jumpProject(mspProject.displayName);
      mspProject.displayName = `edit-${mspProject.displayName}`;
      await projectManage.editProject(mspProject);
      await projectManage.deleteProject(mspProject.displayName);
      const countAfterDelete = await projectManage.searchProject(mspProject.displayName);
      expect(countAfterDelete).toBe(0);
    });
  });
});

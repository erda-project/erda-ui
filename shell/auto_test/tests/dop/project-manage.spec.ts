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
import { wait } from '../../util';

const projectsListPageUrl = 'https://erda.hkci.terminus.io/integration/orgCenter/projects';
const createProjectPageUrl = `${projectsListPageUrl}/createProject`;

const mspProject = {
  type: 'MSP',
  displayName: `auto-msp-${Date.now()}`,
  desc: 'this is msp project description',
};

const dopProject = {
  type: 'dop',
  displayName: `auto-msp-${Date.now()}`,
  desc: 'this is msp project description',
};

Role('Manager', () => {
  test('cancel create project', async ({ page }) => {
    await page.goto(projectsListPageUrl);
    await page.click('button:has-text("add project")');
    await expect(page.url()).toBe(createProjectPageUrl);
    await page.click('button:has-text("cancel")');
    await expect(page.url()).toBe(projectsListPageUrl);
  });
  test.only('msp project crud', async ({ page, expectExist }) => {
    const projectManage = new ProjectManage(page);
    await page.goto(createProjectPageUrl);
    await page.waitForEvent('requestfinished');
    await projectManage.createProject(mspProject);
    const count = await projectManage.searchProject(mspProject.displayName);
    await expect(count).toBe(1);
    await projectManage.jumpProject(mspProject.displayName);
    mspProject.displayName = `edit-${mspProject.displayName}`;
    await projectManage.editProject(mspProject);
    await projectManage.deleteProject(mspProject.displayName);
    const countAfterDelete = await projectManage.searchProject(mspProject.displayName);
    await expect(countAfterDelete).toBe(0);
  });
  test.only('dop project crud', async ({ page, expectExist }) => {
    const projectManage = new ProjectManage(page);
    await page.goto(createProjectPageUrl);
    await page.waitForEvent('requestfinished');
    await projectManage.createProject(mspProject);
    const count = await projectManage.searchProject(mspProject.displayName);
    await expect(count).toBe(1);
    await projectManage.jumpProject(mspProject.displayName);
    mspProject.displayName = `edit-${mspProject.displayName}`;
    await projectManage.editProject(mspProject);
    await projectManage.deleteProject(mspProject.displayName);
    const countAfterDelete = await projectManage.searchProject(mspProject.displayName);
    await expect(countAfterDelete).toBe(0);
  });
});

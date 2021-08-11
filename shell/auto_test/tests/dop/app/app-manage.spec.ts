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

import { Role, test } from '../../../fixtures';
import { expect } from '@playwright/test';
import AppManage from '../../pages/app-manage';

const formData = {
  type: 'business app',
  name: `auto-business-app-${Date.now()}`,
  desc: `auto-business-app-description-${Date.now()}`,
  repository: false,
  template: 'none',
};

Role('Manager', () => {
  test.describe('create app', () => {
    test.beforeEach(async ({ page, goTo }) => {
      await goTo('createApp');
    });
    test('business app manage', async ({ page }) => {
      const app = new AppManage(page);
      await app.createApp(formData);
      await page.click(`text=${formData.name}`);
      await page.waitForNavigation();
      expect(page.url()).toMatch(/\d+\/repo$/);
      await page.click('text=Settings');
      await app.editApp();
      await app.deleteApp(formData.name);
      await page.close();
    });
    test('mobile app manage', async ({ page }) => {
      const app = new AppManage(page);
      await app.createApp({
        ...formData,
        type: 'mobile app',
      });
      await page.click(`text=${formData.name}`);
      await page.waitForNavigation();
      expect(page.url()).toMatch(/\d+\/repo$/);
      await page.click('text=Settings');
      await app.editApp();
      await app.deleteApp(formData.name);
      await page.close();
    });
  });
});

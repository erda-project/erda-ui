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

import { Role, test, expect } from '../../fixtures';
import Base from '../pages/base';
const title = 'terminus' + Date.now();
const testData = {
  image: 'app/images/Erda.png',
};

Role('Manager', () => {
  test('management-center', async ({ page, expectExist, goTo }) => {
    const base = new Base(page);
    await goTo('projectManagement');
    await page.click('button:has-text("add project")');
    expect(page.url()).toMatch(/\/orgCenter\/projects\/createProject/);
    await page.click('[placeholder="The name displayed on the Erda platform, supports Chinese naming"]');
    await page.fill('[placeholder="The name displayed on the Erda platform, supports Chinese naming"]', title);
    await page.click(
      '[placeholder="you can only use lowercase letters or numbers to begin and end. The hyphen can use -"]',
    );
    await page.fill(
      '[placeholder="you can only use lowercase letters or numbers to begin and end. The hyphen can use -"]',
      title,
    );
    await page.click('.ant-checkbox');
    await page.click('.ant-upload');
    await base.uploadFile(testData.image, '[type="file"]');
    await page.click('textarea');
    await page.fill('textarea', title);
    await page.click('button:has-text("save")');
    await page.click('[placeholder="search by project name"]');
    await page.fill('[placeholder="search by project name"]', title);
    await expectExist(`text=${title}`);
    await page.click('.ant-table-row td:nth-child(8)');
  });

  test('Market-administration', async ({ page, expectExist, goTo }) => {
    const base = new Base(page);
    await goTo('projectManagement');
    await page.click('text=Mobile development management');
    expect(page.url()).toMatch(/\/orgCenter\/market\/publisher\/setting/);
    await page.click('button:has-text("edit")');
    await page.click('textarea');
    await page.fill('textarea', title);
    await page.click('.ant-upload');
    await base.uploadFile(testData.image, '[type="file"]');
    await page.click('button:has-text("ok")');
    await expectExist(`text=${title}`, 1);
  });

  test('Audit-log', async ({ page, goTo, expectExist }) => {
    goTo('projectManagement');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda/orgCenter/safety?endAt=2021-10-28%2014%3A17%3A51&pageNo=1&startAt=2021-10-28%2013%3A17%3A51' }*/),
      page.click('text=Audit log'),
    ]);
    const [download] = await Promise.all([
      page.waitForEvent('popup'),
      page.waitForEvent('download'),
      page.click('button:has-text("export")'),
    ]);
    const path = await download.path();
    await expectExist(path);
    await download.close();
  });
});

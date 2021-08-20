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
const testData = {
  title: 'test',
  image: 'app/images/Erda.png',
  svg: 'app/images/zx.svg',
};

Role('Manager', () => {
  test.only('test problem-detail', async ({ page, wait, goTo, expectExist }) => {
    const base = new Base(page);
    await goTo('issueDetail');
    await wait(1);
    // Click text=Issues
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/integration/dop/projects/123/apps/788/ticket/open?pageNo=1' }*/),
      page.click('text=Issues'),
    ]);
    await page.click('text=#84');
    expect(page.url()).toMatch(/\/dop\/projects\/[1-9]\d*\/apps\/[1-9]\d*\/ticket\/open\/[1-9]\d*/);
    await wait(2);
    await expectExist('text=close');
    // Click button:has-text("close")
    await page.click('button:has-text("close")');
    await wait(1);
    await page.click('textarea[name="textarea"]');
    // Fill textarea[name="textarea"]
    await page.fill('textarea[name="textarea"]', testData.title);
    // Click .button.button-type-annex
    await page.click('.button.button-type-annex');
    // Click span[role="button"]:has-text("image upload")
    await page.click('span[role="button"]:has-text("image upload")');
    await base.uploadFile(testData.image, '[type="file"]');
    await base.uploadFile(testData.svg, '[type="file"]');
    // Click button:has-text("submit comments")
    await page.click('button:has-text("submit comments")');
    await wait(1);
    await page.close();
  });
});

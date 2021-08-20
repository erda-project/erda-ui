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
const title = 'auto_' + Date.now();

const testData = {
  title,
  image: 'app/images/Erda.png',
  svg: 'app/images/zx.svg',
};

Role('Manager', () => {
  test('add-ticket', async ({ page, expectExist, goTo }) => {
    const base = new Base(page);
    await goTo('problemList');
    // Click button:has-text("add ticket")
    await page.click('button:has-text("add ticket")');
    // Click button:has-text("ok")
    await page.click('button:has-text("ok")');
    // Fill text=ticket titleplease input ticket title >> input[type="text"]
    await page.fill('text=ticket titleplease input ticket title >> input[type="text"]', testData.title);
    // Click textarea[name="textarea"]
    await page.click('textarea[name="textarea"]');
    // Fill textarea[name="textarea"]
    await page.fill('textarea[name="textarea"]', testData.title);
    // Click .button.button-type-annex
    await page.click('.button.button-type-annex');
    // Click span[role="button"]:has-text("image upload")
    await page.click('span[role="button"]:has-text("image upload")');
    await base.uploadFile(testData.image, '[type="file"]');
    await base.uploadFile(testData.svg, '[type="file"]');
    // Click text=preview
    await page.click('text=preview');
    // Click text=ticket typeplease select ticket type >> input[role="combobox"]
    await page.click('text=ticket typeplease select ticket type >> input[role="combobox"]');
    // Click div[role="document"] >> text=code defect
    await page.click('div[role="document"] >> text=code defect');
    // Click span:has-text("code defect")
    await page.click('span:has-text("code defect")');
    // Click .rc-virtual-list-holder-inner div:nth-child(2)
    await page.click('.rc-virtual-list-holder-inner div:nth-child(2)');
    // Click text=vulnerabilitycode vulnerabilitybugvulnerabilitycodeSmellcode defectcode vulnerab >> div
    await page.click('text=vulnerabilitycode vulnerabilitybugvulnerabilitycodeSmellcode defectcode vulnerab >> div');
    // Click div[role="document"] >> text=code smell
    await page.click('div[role="document"] >> text=code smell');
    // Click div[role="document"] >> text=medium
    await page.click('div[role="document"] >> text=medium');
    await page.click('div[role="document"] >> text=high');
    await page.click('div[role="document"] >> text=low');
    // Click button:has-text("ok")
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.title}`, 0);
    await page.close();
  });
});

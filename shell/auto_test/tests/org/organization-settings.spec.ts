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
  title,
  memberName: '吴辉洛',
  manager: '组织管理员',
  image: 'app/images/Erda.png',
  memberBoss: 'erda-ui-team',
};

Role('Manager', () => {
  test.only('organization-settings', async ({ wait, page, expectExist, goTo }) => {
    await goTo('organization');
    // Click button:has-text("add member")
    await page.click('button:has-text("add member")');
    await page.click('.ant-select.w-full .ant-select-selector .ant-select-selection-overflow');
    await page.fill('text=member Please enter a member name to search >> input[role="combobox"]', testData.memberName);
    await page.click('.ant-select-item-option-content');
    await page.click(
      '.ant-form div:nth-child(3) .ant-col.ant-form-item-control .ant-form-item-control-input .ant-form-item-control-input-content .ant-select .ant-select-selector .ant-select-selection-overflow',
    );
    await page.click(':nth-match(:text("outsource"), 2)');
    await page.click(
      '.ant-form div:nth-child(2) .ant-col.ant-form-item-control .ant-form-item-control-input .ant-form-item-control-input-content .ant-select .ant-select-selector .ant-select-selection-overflow',
    );
    await page.click(`div[role="document"] >> text=${testData.manager}`);
    await page.click('div:nth-child(2) .ant-modal .ant-modal-content .ant-modal-body');
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.memberName}`, 2);
    // Click button:has-text("invite")
    await page.click('button:has-text("invite")');
    await page.click('text=url address');
    await page.click('text=verification code');
    await page.click('button:has-text("copy")');
    await page.click('[aria-label="Close"]');

    await page.click('[placeholder="search by nickname, username, email or mobile number"]');
    await page.fill('[placeholder="search by nickname, username, email or mobile number"]', testData.memberBoss);
    await page.click('input[role="combobox"]');
    await page.click(`text=${testData.manager}`);
    await expectExist(`text=${testData.memberBoss}`, 1);
    await expectExist('text=edit', 2);
    await expectExist('text=exit', 1);
    await page.fill('[placeholder="search by nickname, username, email or mobile number"]', testData.memberName);
    await expectExist('text=edit', 2);
    await expectExist('text=remove', 0);
    await page.click('text=remove');
    await page.click('text=OK');
    await expectExist('text=no data', 0);

    // const base = new Base(page);
    // await goTo('organization');
    // await expectExist('text=organization identifier', 0);
    // await expectExist('text=org name', 0);
    // await expectExist('text=notice language', 0);
    // await expectExist('text=org description', 0);
    // // Click button:has-text("edit")
    // await page.click('button:has-text("edit")');
    // await expectExist('text=edit org info', 1);
    // await expectExist('.ant-input-disabled', 1);
    // // Click #displayName
    // await page.click('#displayName');
    // // Fill #displayName
    // await page.fill('#displayName', testData.title);
    // // Click span:has-text("Chinese")
    // await page.click('span:has-text("Chinese")');
    // // Click text=English
    // await page.click('text=English');
    // // Click text=English
    // await page.click('text=English');
    // // Click div[role="document"] >> text=Chinese
    // await page.click('div[role="document"] >> text=Chinese');
    // // Click text=private org
    // await page.click('text=private org');
    // // Click span:has-text("public org")
    // await page.click('span:has-text("public org")');
    // // Click svg:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")
    // await page.click(
    //   'svg:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")',
    // );
    // // Click span[role="button"]:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")
    // await page.click(
    //   'span[role="button"]:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")',
    // );
    // await base.uploadFile(testData.image, '[type="file"]');
    // // Click input[type="textarea"]
    // await page.click('input[type="textarea"]');
    // // Fill input[type="textarea"]
    // await page.fill('input[type="textarea"]', testData.title);
    // // Click button:has-text("ok")
    // await page.click('button:has-text("ok")');
    // // Click button:has-text("exit current org")
    // await page.click('button:has-text("exit current org")');
    // // Click button:has-text("ok")
    // await Promise.all([
    //   page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda' }*/),
    //   page.click('button:has-text("ok")'),
    // ]);
    // expect(page.url()).toMatch(/\/erda/);
  });
});

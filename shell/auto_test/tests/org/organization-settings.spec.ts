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
const modifyTitle = 'modified' + Date.now();
const testData = {
  title,
  modifyTitle,
  memberName: '吴辉洛',
  manager: '组织管理员',
  image: 'app/images/Erda.png',
  memberBoss: 'erda-ui-team',
  networkClose: '确认开启封网',
};

Role('Manager', () => {
  test.only('organization-settings', async ({ wait, page, expectExist, goTo }) => {
    const base = new Base(page);
    await goTo('organizationMember');
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
    await page.click('button:has-text("invite")');
    await page.click('text=url address');
    await page.click('text=verification code');
    await page.click('button:has-text("copy")');
    await page.click('[aria-label="Close"]');
    await page.click('[placeholder="search by nickname, username, email or mobile number"]');
    await page.fill('[placeholder="search by nickname, username, email or mobile number"]', testData.memberName);
    await page.click('input[role="combobox"]');
    await page.click(`text=${testData.manager}`);
    await expectExist(`text=${testData.memberName}`, 2);
    await expectExist('text=edit', 2);
    await expectExist('text=exit', 0);
    await page.fill('[placeholder="search by nickname, username, email or mobile number"]', testData.memberName);
    await expectExist('text=edit', 2);
    await expectExist('text=remove');
    await page.click('text=remove');
    await page.click('text=OK');
    await expectExist('text=no data', 0);
    await page.click('text=issue custom fields');
    expect(page.url()).toMatch(/\/orgCenter\/setting\/detail\?tabKey=issueField/);
    await page.click('button:has-text("add")');
    await page.click('[placeholder="please enter field name"]');
    await page.fill('[placeholder="please enter field name"]', testData.title);
    await page.click('span:has-text("yes")');
    await page.click('input[role="combobox"]');
    await page.click(':nth-match(:text("Text"), 2)');
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.title}`, 0);
    await page.click(`text=${testData.title}yesTexteditdelete >> :nth-match(span, 2)`);
    await page.click('[placeholder="please enter field name"]');
    await page.fill('[placeholder="please enter field name"]', testData.modifyTitle);
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.modifyTitle}`, 0);
    await page.click('text=joint issue type');
    await page.click('text=requirement');
    await page.click('input[role="combobox"]');
    await page.click(':nth-match(:text("test"), 2)');
    await page.click('button:has-text("reference")');
    await page.click('text=testTextremovemove upmove down >> span');
    await page.click('button:has-text("OK")');
    await page.click('li:has-text("block network")');
    expect(page.url()).toMatch(/\/orgCenter\/setting\/detail\?tabKey=block-network/);
    await page.click('text=prod environmentoff >> button[role="switch"]');
    await page.click('button:has-text("OK")');
    await expectExist('text=on');
    await page.click('button[role="switch"]:has-text("on")');
    await page.click('button:has-text("OK")');
    await expectExist('text=off');
    await page.click('#main >> text=audit log');
    expect(page.url()).toMatch(/\/orgCenter\/setting\/detail\?tabKey=operation%20log/);
    await page.click('[aria-label="Increase Value"]');
    await page.click('button:has-text("update")');
    expectExist('text=updated successfully', 0);
    await page.click('li:has-text("notification group")');
    expect(page.url()).toMatch(/\/orgCenter\/setting\/detail\?tabKey=notifyGroup/);
    await page.click('button:has-text("new notification group")');
    await page.click('input[type="text"]');
    await page.fill('input[type="text"]', testData.title);
    await page.click('text=group namenotified to >> :nth-match(span, 2)');
    await page.click('div[role="document"] >> text=member');
    await page.click('.ant-dropdown-trigger');
    await page.click('[placeholder="search by keywords"]');
    await page.fill('[placeholder="search by keywords"]', testData.memberName);
    await page.click(`text=${testData.memberName}(${testData.manager})`);
    await page.click('text=new Group');
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.memberName}`);
    await page.click('text=org info');
    expect(page.url()).toMatch(/\/orgCenter\/setting\/detail\?tabKey=orgInfo/);
    await expectExist('text=organization identifier');
    await expectExist('text=org name');
    await expectExist('text=notice language');
    await expectExist('text=org description');
    await page.click('button:has-text("edit")');
    await expectExist('text=edit org info', 1);
    await expectExist('.ant-input-disabled', 1);
    await page.click('#displayName');
    await page.fill('#displayName', testData.title);
    await page.click('span:has-text("Chinese")');
    await page.click('text=English');
    await page.click('text=English');
    await page.click('div[role="document"] >> text=Chinese');
    await page.click('text=private org');
    await page.click('span:has-text("public org")');
    await page.click(
      'svg:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")',
    );
    await page.click(
      'span[role="button"]:has-text("@font-face{font-family:feedback-iconfont;src:url(//at.alicdn.com/t/font_1031158_")',
    );
    await base.uploadFile(testData.image, '[type="file"]');
    await page.click('input[type="textarea"]');
    await page.fill('input[type="textarea"]', testData.title);
    await page.click('button:has-text("ok")');
    await page.click('button:has-text("exit current org")');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda' }*/),
      page.click('button:has-text("ok")'),
    ]);
    expect(page.url()).toMatch(/\/erda/);
    await page.close();
  });
});

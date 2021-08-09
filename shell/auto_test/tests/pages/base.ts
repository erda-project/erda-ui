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

import { Page } from '@playwright/test';

export default class Base {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async clickEle(el: keyof HTMLElementTagNameMap, text: string) {
    await this.page.click(`${el}:has-text("${text}")`);
  }

  async search(selector: string, keyword: string) {
    await this.page.click(selector);
    await this.page.fill(selector, keyword);
    await this.page.press(selector, 'Enter');
  }

  async clickAnchor(text: string) {
    await this.clickEle('a', text);
  }

  async clickButton(text: string) {
    await this.clickEle('button', text);
  }
}

// playwright-dev-page.ts
import type { Page } from 'playwright';
import { wait } from '../../util';

export class UserManagePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createUser(formData) {
    await this.page.click('button:has-text("create user")');

    // Click text=user namepasswordnickcellphoneemail >> input[type="text"]
    await this.page.click('text=user namepasswordnickcellphoneemail >> input[type="text"]');

    // Fill text=user namepasswordnickcellphoneemail >> input[type="text"]
    await this.page.fill('text=user namepasswordnickcellphoneemail >> input[type="text"]', formData.name);

    // Click input[type="password"]
    await this.page.click('input[type="password"]');

    // Fill input[type="password"]
    await this.page.fill('input[type="password"]', formData.password);

    // Click text=user namepasswordnickcellphoneemail >> #nick
    await this.page.click('text=user namepasswordnickcellphoneemail >> #nick');

    // Fill text=user namepasswordnickcellphoneemail >> #nick
    await this.page.fill('text=user namepasswordnickcellphoneemail >> #nick', formData.nick);

    // Press Enter
    await this.page.press('text=user namepasswordnickcellphoneemail >> #nick', 'Enter');

    // Click text=user namepasswordnickcellphoneemail >> #phone
    await this.page.click('text=user namepasswordnickcellphoneemail >> #phone');

    // Fill text=user namepasswordnickcellphoneemail >> #phone
    await this.page.fill('text=user namepasswordnickcellphoneemail >> #phone', formData.phone);

    // Click text=user namepasswordnickcellphoneemail >> #email
    await this.page.click('text=user namepasswordnickcellphoneemail >> #email');

    // Fill text=user namepasswordnickcellphoneemail >> #email
    await this.page.fill('text=user namepasswordnickcellphoneemail >> #email', formData.email);

    // Click button:has-text("ok")
    await this.page.click('button:has-text("ok")');
  }

  async filterUser(filterData, selector: string) {
    await this.clearFilter();
    // await this.page.waitForLoadState('networkidle'); // This resolves after 'networkidle'

    const list = Object.keys(filterData);
    for (let i = 0, len = list.length; i < len; i++) {
      await this.page.fill(`#${list[i]}`, filterData[list[i]]);
    }
    await Promise.all([this.page.waitForNavigation(), wait(0.2)]);
    const doms = await this.page.$$(selector);
    return doms.length;
  }

  async clearFilter() {
    const clearIconList = await this.page.$$('.anticon-close-circle:visible');
    if (clearIconList.length) {
      clearIconList.forEach((dom) => dom.click());
    }
  }
}

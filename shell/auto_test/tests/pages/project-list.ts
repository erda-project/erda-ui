// playwright-dev-page.ts
import type { Page } from 'playwright';

export class ProjectListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getStarted() {
    await this.page.click('text=Get started');
    await this.page.waitForSelector(`text=Core concepts`);
  }

  async coreConcepts() {
    await this.getStarted();
    await this.page.click('text=Core concepts');
    await this.page.waitForSelector(`h1:has-text("Core concepts")`);
  }
}

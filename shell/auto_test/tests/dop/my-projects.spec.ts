import { test, expect } from '@playwright/test';
import { ProjectListPage } from '../pages/project-list';

test.use({
  storageState: 'auto_test/auth/Manager.json',
});

test.describe('my project list', () => {
  test('project list', async ({ page }) => {
    // Go to https://erda.hkci.terminus.io/integration/dop
    await page.goto('https://erda.hkci.terminus.io/integration/dop');

    // const pej = new ProjectListPage(page);
    expect(page.url()).toBe('https://erda.hkci.terminus.io/integration/dop/projects');

    // Click text=erda私有项目51 天前 >> div
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/integration/dop/projects/3/apps' }*/),
      page.click('text=erda私有项目51 天前 >> div'),
    ]);

    // Click span:nth-child(3) .pk-breadcrumb-link .breadcrumb-name
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/integration/dop/projects/3/apps' }*/),
      page.click('span:nth-child(3) .pk-breadcrumb-link .breadcrumb-name'),
    ]);

    // Click text=DevOps platform
    await page.click('text=DevOps platform');
    expect(page.url()).toBe('https://erda.hkci.terminus.io/integration/dop/projects');
  });

  // test.use({
  //   storageState: 'Dev'
  // })

  test('app list', async ({ page }) => {
    // Go to https://erda.hkci.terminus.io/integration/dop/projects/1/apps
    await page.goto('https://erda.hkci.terminus.io/integration/dop/projects/2/apps');

    // await new Promise((r) => {
    //   setTimeout(r, 5000);
    // })
  });
});

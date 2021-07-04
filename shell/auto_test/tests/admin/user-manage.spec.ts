import { UserManagePage } from './../pages/user-manage';
import { test, expect } from '@playwright/test';
import { adminFormData } from './user-manage.secret';

test.use({
  storageState: 'auto_test/auth/Admin.json',
});

test.describe('user manage', () => {
  test('test', async ({ page }) => {
    // Go to https://erda.hkci.terminus.io/-/sysAdmin/orgs
    await page.goto('https://erda.hkci.terminus.io/-/sysAdmin/user-manage');

    const userCount = (await page.$$(`text=${adminFormData.name}`)).length;
    const userManagePage = new UserManagePage(page);

    if (userCount === 0) {
      await userManagePage.createUser(adminFormData);

      expect((await page.$$(`text=${adminFormData.name}`)).length).toBe(1);
    } else {
      let count = await userManagePage.filterUser(
        {
          name: 'should not exist',
        },
        'td div:has-text("no data")',
      );
      expect(count).toBe(1);

      count = await userManagePage.filterUser(
        {
          phone: adminFormData.phone,
          nick: adminFormData.nick,
        },
        `text=${adminFormData.phone}`,
      );
      expect(count).toBe(1);

      count = await userManagePage.filterUser(
        {
          nick: adminFormData.nick,
        },
        `text=${adminFormData.phone}`,
      );
      expect(count).toBe(1);

      count = await userManagePage.filterUser(
        {
          email: adminFormData.email,
        },
        `text=${adminFormData.phone}`,
      );
      expect(count).toBe(1);
    }
  });
});

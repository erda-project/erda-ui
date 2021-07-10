import { UserManagePage } from './../pages/user-manage';
import { Role, test } from '../../fixtures';

const name = 'auto_' + Date.now();
const formData = {
  name,
  password: 'auto_test_user',
  nick: name,
  phone: '',
  email: `${name}@erda.cloud`,
};

Role('Admin', () => {
  test('user manage', async ({ page, wait, expectExist, expectRequestSuccess }) => {
    await expectRequestSuccess();

    // Go to https://erda.hkci.terminus.io/-/sysAdmin/orgs
    await page.goto('https://erda.hkci.terminus.io/-/sysAdmin/user-manage');

    // Click [placeholder="user name"]
    await page.click('[placeholder="user name"]');
    // Fill [placeholder="user name"]
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/user-manage?name=auto_123&pageNo=1' }*/),
      page.fill('[placeholder="user name"]', formData.name),
    ]);

    await wait(1);
    expectExist('text=no data', 1);

    const userManagePage = new UserManagePage(page);

    await userManagePage.createUser(formData);
    await wait(2);

    await expectExist(`text=${formData.email}`, 1);

    await userManagePage.filterUser({
      name: 'should not exist',
    });
    await wait(1);
    await expectExist('text=no data', 1);

    await userManagePage.filterUser({
      phone: formData.phone,
      nick: formData.nick,
    });
    await wait(1);
    await expectExist(`text=${formData.email}`, 1);

    await userManagePage.filterUser({
      nick: formData.nick,
    });
    await wait(1);
    await expectExist(`text=${formData.email}`, 1);

    await userManagePage.filterUser({
      email: formData.email,
    });
    await wait(1);
    await expectExist(`text=${formData.email}`, 1);
    await page.close();
  });
});

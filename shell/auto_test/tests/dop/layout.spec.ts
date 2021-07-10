import { Role, test } from '../../fixtures';

Role('Manager', () => {
  test('have full platforms entry', async ({ page, expectExist }) => {
    // Go to https://erda.hkci.terminus.io/integration
    await page.goto('https://erda.hkci.terminus.io/integration');

    // Click [aria-label="icon: appstore"]
    await page.click('[aria-label="icon: appstore"]');

    await expectExist('a:has-text("DevOps platform")', 1);
    await expectExist('a:has-text("Microservice platform")', 1);
    await expectExist('a:has-text("cloud management")', 1);
    await expectExist('a:has-text("edge computing")', 1);
    await expectExist('a:has-text("Fast data")', 1);
    await expectExist('a:has-text("OrgCenter")', 1);
  });
});

Role('Dev', () => {
  test('have part platforms entry', async ({ page, expectExist }) => {
    // Go to https://erda.hkci.terminus.io/integration
    await page.goto('https://erda.hkci.terminus.io/integration');

    // Click [aria-label="icon: appstore"]
    await page.click('[aria-label="icon: appstore"]');

    await expectExist('a:has-text("DevOps platform")', 1);
    await expectExist('a:has-text("Microservice platform")', 1);
    await expectExist('a:has-text("cloud management")', 0);
    await expectExist('a:has-text("edge computing")', 0);
    await expectExist('a:has-text("Fast data")', 0);
    await expectExist('a:has-text("OrgCenter")', 0);
  });
});

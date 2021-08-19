import { Role, test, expect } from '../../fixtures';

Role('Manager', () => {
  test('unit-test list', async ({ page, wait, expectExist }) => {
    await page.goto('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/test');
    await expectExist('text=name', 0);
    await expectExist('th:has-text("branch")', 0);
    await expectExist('text=creator', 0);
    await expectExist('text=create time', 0);
    await expectExist('text=type', 0);
    await expectExist('text=time consuming', 0);
    await expectExist('text=execute result', 0);
    // Click text=ut-13a193
    await page.click('text=ut-be5d95');
    expect(page.url()).toBe('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/test/1');
    await wait(1);
    await expectExist('text=test detail', 1);
  });
});

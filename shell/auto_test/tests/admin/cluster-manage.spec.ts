import { test, expect } from '../../fixtures';

test.use({
  storageState: 'auto_test/auth/Admin.json',
});

test('cluster manage', async ({ page, wait, expectExist }) => {
  // Go to https://erda.hkci.terminus.io/-/sysAdmin/orgs
  await page.goto('https://erda.hkci.terminus.io/-/sysAdmin/orgs');

  // Click text=Clusters
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/cluster-manage?pageNo=1' }*/),
    page.click('text=Clusters'),
  ]);

  // Click text=erda-hongkong
  await page.click('text=erda-hongkong');

  // Click text=please choose organization name
  await page.click('text=please choose organization name');

  // Click text=integration
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/cluster-manage?orgName=integration&pageNo=1' }*/),
    page.click('text=integration'),
  ]);

  // Click form span div div:has-text("integration")
  await page.click('form span div div:has-text("integration")');

  // Click text=keyifangshujiazuzhi
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/cluster-manage?orgName=keyifangshujiazuzhi&pageNo=1' }*/),
    page.click('text=keyifangshujiazuzhi'),
  ]);

  // Click input[role="combobox"]
  await page.click('input[role="combobox"]');

  // Click button:has-text("operation history")
  await page.click('button:has-text("operation history")');
  expect(page.url()).toBe(
    'https://erda.hkci.terminus.io/-/sysAdmin/cluster-manage/history?recordType=upgradeEdgeCluster&scope=system',
  );

  await page.close();
});

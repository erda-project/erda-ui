import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auto_test/auth/Admin.json',
});

test.skip('org manage', async ({ page }) => {
  // Go to https://erda.hkci.terminus.io/-/sysAdmin/orgs
  await page.goto('https://erda.hkci.terminus.io/-/sysAdmin/orgs');

  expect(await page.$('text=autoTest')).toBeNull();

  // Click button:has-text("add org")
  await page.click('button:has-text("add org")');

  // Click text=org nameorganization identifybecome a publisherorg logoupload imagesupport: jpg/ >> input[type="text"]
  await page.click(
    'text=org nameorganization identifybecome a publisherorg logoupload imagesupport: jpg/ >> input[type="text"]',
  );

  // Fill text=org nameorganization identifybecome a publisherorg logoupload imagesupport: jpg/ >> input[type="text"]
  await page.fill(
    'text=org nameorganization identifybecome a publisherorg logoupload imagesupport: jpg/ >> input[type="text"]',
    'autoTest',
  );

  // Click input[type="textarea"]
  await page.click('input[type="textarea"]');

  // Fill input[type="textarea"]
  await page.fill('input[type="textarea"]', 'auto test org');

  // Click input[role="combobox"]
  await page.click('input[role="combobox"]');

  // Fill input[role="combobox"]
  await page.fill('input[role="combobox"]', 'erda');

  // Click .ant-select-item
  await page.click('.ant-select-item');

  // Click button:has-text("ok")
  await page.click('button:has-text("ok")');
  expect((await page.$$('text=autoTest')).length).toBe(1);

  // Click [aria-label="icon: bianji"]
  await page.click('[aria-label="icon: bianji"]');

  // Click text=org nameorganization identifyorg logoupload imagesupport: jpg/png/gif，less than  >> input[type="text"]
  await page.click(
    'text=org nameorganization identifyorg logoupload imagesupport: jpg/png/gif，less than  >> input[type="text"]',
  );

  // Fill text=org nameorganization identifyorg logoupload imagesupport: jpg/png/gif，less than  >> input[type="text"]
  await page.fill(
    'text=org nameorganization identifyorg logoupload imagesupport: jpg/png/gif，less than  >> input[type="text"]',
    'autoTest2',
  );

  // Click input[type="textarea"]
  await page.click('input[type="textarea"]');

  // Fill input[type="textarea"]
  await page.fill('input[type="textarea"]', 'auto test org2');

  // Click button:has-text("ok")
  await page.click('button:has-text("ok")');

  // Click text=autoTest2
  await page.click('text=autoTest2');

  // Click text=erda 前端
  await page.click('text=erda 前端');

  // Click [aria-label="icon: shanchu"]
  await page.click('[aria-label="icon: shanchu"]');

  // Click button:has-text("OK")
  await page.click('button:has-text("OK")');
  expect(await page.$('text=autoTest')).toBeNull();
});

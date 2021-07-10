import { Role, test } from '../../fixtures';

test.use({
  acceptDownloads: true,
});

Role('Admin', () => {
  test('audit log page', async ({ page, wait, expectExist, expectRequestSuccess }) => {
    // Go to https://erda.hkci.terminus.io/-/sysAdmin/orgs
    await page.goto('https://erda.hkci.terminus.io/-/sysAdmin/orgs', { timeout: 15000 });

    // Click text=Audit log
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/audit-log?endAt=2021-07-06%2020%3A35%3A00&pageNo=1&startAt=2021-07-06%2019%3A35%3A00&sys=true' }*/),
      page.click('text=Audit log'),
    ]);

    // Click form span >> :nth-match(div, 3)
    await page.click('form span >> :nth-match(div, 3)');

    // Fill input[role="combobox"]
    await page.fill('input[role="combobox"]', 'someone not exist');
    await wait(1);
    await expectExist('text=please confirm that the user is registered', 1);

    // Fill input[role="combobox"]
    await page.fill('input[role="combobox"]', 'ad');
    await wait(1);

    await page.click('#main >> text=admin');
    // Click [placeholder="Start date"]
    await page.click('[placeholder="Start date"]');
    // Click .ant-picker-header-prev-btn
    await page.click('.ant-picker-header-prev-btn');
    // Click .ant-picker-cell.ant-picker-cell-start
    await page.click('.ant-picker-cell.ant-picker-cell-start');
    // Click button:has-text("Ok")
    await Promise.all([page.waitForNavigation(), page.click('button:has-text("Ok")')]);

    await page.click('button:has-text("Ok")');
    await wait(1);
    await expectExist('text=no data', 0);

    // Click [placeholder="Start date"]
    await page.click('[placeholder="Start date"]');
    // Click .ant-picker-header-super-next-btn
    await page.click('.ant-picker-header-super-next-btn');
    // Click .ant-picker-cell.ant-picker-cell-start
    await page.click('.ant-picker-cell.ant-picker-cell-start');
    // Click button:has-text("Ok")
    await page.click('button:has-text("Ok")');
    // Click .ant-picker-cell.ant-picker-cell-start .ant-picker-cell-inner
    await page.click('.ant-picker-cell.ant-picker-cell-start .ant-picker-cell-inner');
    // Click button:has-text("Ok")
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/-/sysAdmin/audit-log?endAt=2022-07-01%2009%3A56%3A00&pageNo=1&startAt=2022-07-01%2009%3A54%3A54&sys=true' }*/),
      page.click('button:has-text("Ok")'),
    ]);

    await wait(1);
    await expectExist('text=no data', 1);

    // Click button:has-text("export")
    // const [page1] = await Promise.all([
    //   page.waitForEvent('popup'),
    //   page.waitForEvent('download'),
    //   page.click('button:has-text("export")')
    // ]);

    // Close page
    await page.close();
  });
});

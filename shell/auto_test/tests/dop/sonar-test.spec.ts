import { Role, test, expect } from '../../fixtures';

Role('Manager', () => {
  test('sonar-test', async ({ page, wait, expectExist }) => {
    await page.goto('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/test/quality');
    await expectExist('text=recent detection time', 0);
    await expectExist('text=detection branch', 0);
    await expectExist('text=submit ID', 0);
    await expectExist('text=code defect6D', 0);
    await expectExist('text=code vulnerability0A', 0);
    await expectExist('text=code smell22A', 0);
    await page.click('text=3dacc1');
    expect(page.url()).toBe(
      'https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/repo/commit/3dacc11ac8439f3f63df02be32364731821df0aa',
    );
    await wait(1);
    await page.goto('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/test/quality');
    await page.click('text=coverage 0%');
    await page.click('text=market.tsx');
    await wait(1);
    await page.click('text=repeat rate 1.5%');
    await expectExist('#rc-tabs-6-panel-duplications >> text=file name', 0);
    await expectExist('#rc-tabs-6-panel-duplications >> text=file path', 0);
    await expectExist('th:has-text("repeat rate")', 1);
    await expectExist('text=repeat number of lines', 1);
    await page.click('text=src/pages/join/config.tsx');
    await wait(1);
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/open?pageNo=1&type=bug' }*/),
      page.click('text=code defect'),
    ]);
    await page.click('text=code defect');
    await page.click('form >> :nth-match(:text("code defect"), 2)');
    await page.click('text=no-labelfilter by priority >> input[role="combobox"]');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/all?pageNo=1&priority=low&type=bug' }*/),
      page.click(':nth-match(:text("low"), 2)'),
    ]);
    await page.click(':nth-match(:text("low"), 2)');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/all?pageNo=1&priority=medium&type=bug' }*/),
      page.click(':nth-match(:text("medium"), 2)'),
    ]);
    await page.click(':nth-match(:text("medium"), 2)');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/all?pageNo=1&priority=high&type=bug' }*/),
      page.click(':nth-match(:text("high"), 2)'),
    ]);
    await page.click('[placeholder="filter by title"]');
    await page.fill('[placeholder="filter by title"]', 'missing');
    await page.close();
  });
});

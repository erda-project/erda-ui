import { Role, test, expect } from '../../fixtures';

const testData = {
  title: 'test',
  image: `${process.cwd()}/app/images/Erda.png`,
  svg: `${process.cwd()}/app/images/zx.svg`,
};

Role('Manager', () => {
  test.only('test problem-detail', async ({ page, wait, expectExist }) => {
    // Go to https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/open/28
    await page.goto('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/open/28');
    await wait(1);
    // Click text=Issues
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://erda.hkci.terminus.io/integration/dop/projects/123/apps/788/ticket/open?pageNo=1' }*/),
      page.click('text=Issues'),
    ]);
    // Click text=#58
    await page.click('text=#60');
    expect(page.url()).toBe('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/open/60');
    await wait(2);
    await expectExist('text=close');
    // Click button:has-text("close")
    await page.click('button:has-text("close")');
    await wait(1);
    await page.click('textarea[name="textarea"]');
    // Fill textarea[name="textarea"]
    await page.fill('textarea[name="textarea"]', testData.title);
    // Click .button.button-type-annex
    await page.click('.button.button-type-annex');
    // Click span[role="button"]:has-text("image upload")
    await page.click('span[role="button"]:has-text("image upload")');
    // Upload Erda.png
    await page.setInputFiles('[type="file"]', testData.image);
    await page.setInputFiles('[type="file"]', testData.svg);
    // Click button:has-text("submit comments")
    await page.click('button:has-text("submit comments")');
    await wait(1);
    await page.close();
  });
});

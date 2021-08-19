import { Role, test, expect } from '../../fixtures';

const title = 'auto_' + Date.now();

const testData = {
  title,
  image: `${process.cwd()}/app/images/Erda.png`,
  svg: `${process.cwd()}/app/images/zx.svg`,
};

Role('Manager', () => {
  test('add-ticket', async ({ page, expectExist }) => {
    // Go to https://erda.hkci.terminus.io/integration/dop/projects/123/apps/788/ticket/open?pageNo=1
    await page.goto('https://erda.hkci.terminus.io/erda/dop/projects/1/apps/16/ticket/open?pageNo=1');
    // Click button:has-text("add ticket")
    await page.click('button:has-text("add ticket")');
    // Click button:has-text("ok")
    await page.click('button:has-text("ok")');
    // Fill text=ticket titleplease input ticket title >> input[type="text"]
    await page.fill('text=ticket titleplease input ticket title >> input[type="text"]', testData.title);
    // Click textarea[name="textarea"]
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
    // Click text=preview
    await page.click('text=preview');
    // Click text=ticket typeplease select ticket type >> input[role="combobox"]
    await page.click('text=ticket typeplease select ticket type >> input[role="combobox"]');
    // Click div[role="document"] >> text=code defect
    await page.click('div[role="document"] >> text=code defect');
    // Click span:has-text("code defect")
    await page.click('span:has-text("code defect")');
    // Click .rc-virtual-list-holder-inner div:nth-child(2)
    await page.click('.rc-virtual-list-holder-inner div:nth-child(2)');
    // Click text=vulnerabilitycode vulnerabilitybugvulnerabilitycodeSmellcode defectcode vulnerab >> div
    await page.click('text=vulnerabilitycode vulnerabilitybugvulnerabilitycodeSmellcode defectcode vulnerab >> div');
    // Click div[role="document"] >> text=code smell
    await page.click('div[role="document"] >> text=code smell');
    // Click div[role="document"] >> text=medium
    await page.click('div[role="document"] >> text=medium');
    await page.click('div[role="document"] >> text=high');
    await page.click('div[role="document"] >> text=low');
    // Click button:has-text("ok")
    await page.click('button:has-text("ok")');
    await expectExist(`text=${testData.title}`, 0);
    await page.close();
  });
});

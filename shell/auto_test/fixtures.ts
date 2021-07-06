import base, { expect } from '@playwright/test';

type TestFixtures = {
  wait(seconds: number): void;
  expectCount(seconds: string, count: number): boolean;
};

// Extend base test with our fixtures.
const test = base.extend<TestFixtures>({
  // This fixture is a constant, so we can just provide the value.
  // hello: 'Hello',

  wait: async ({ page }, use) => {
    await use(async (seconds = 1) => {
      await new Promise((re) => setTimeout(re, seconds * 1000));
    });
  },

  expectCount: async ({ page }, use) => {
    // Use the fixture value in the test.
    await use(async (selector, count = 0) => {
      const total = await page.$$(selector).length;
      return expect(total).toBe(count);
    });

    // Clean up the fixture. Nothing to cleanup in this example.
  },
});

export { test, expect };

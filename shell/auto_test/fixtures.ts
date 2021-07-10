import base, { expect } from '@playwright/test';
import { RoleTypes } from './login.spec';

interface TestFixtures {
  version: string;
  wait: (seconds?: number) => void;
  expectExist: (seconds: string, count?: number) => boolean;
  expectRequestSuccess: () => void;
  goTo: (key: string) => void;
}

// Extend base test with our fixtures.
const test = base.extend<TestFixtures>({
  // This fixture is a constant, so we can just provide the value.
  version: '1.0', // provide different value by project.use config

  wait: async ({ page }, use) => {
    await use(async (seconds) => {
      if (seconds !== undefined) {
        await Promise.all([
          await page.waitForLoadState('networkidle'),
          new Promise((re) => setTimeout(re, seconds * 1000)),
        ]);
      } else {
        await page.waitForLoadState('networkidle');
      }
    });
  },

  expectRequestSuccess: async ({ page }, use) => {
    await use(async () => {
      page.on('response', (response) => {
        const firstNumber = String(response.status()).slice(0, 1);
        if (response.url().startsWith('/api')) {
          if (firstNumber !== '2') {
            console.log('request fail:', response.url());
          }
          expect(firstNumber).toBe('2');
        }
      });
    });
  },

  expectExist: async ({ page }, use) => {
    // Use the fixture value in the test.
    await use(async (selector, count) => {
      const total = (await page.$$(selector)).length;
      return count === undefined ? expect(total).toBeGreaterThan(0) : expect(total).toBe(count);
    });

    // Clean up the fixture. Nothing to cleanup in this example.
  },

  goTo: async ({ page }, use) => {
    const gotoMap = {
      root: '',
    };
    await use(async (key) => {
      await page.goto(gotoMap[key]);
    });
  },
});

const Role = (role: RoleTypes, fn: () => void) => {
  test.describe(`[${role}]`, () => {
    test.use({
      storageState: `auto_test/auth/${role}.json`,
    });

    fn();
  });
};

export { test, expect, Role };

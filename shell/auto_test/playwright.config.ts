import { PlaywrightTestConfig, selectors } from '@playwright/test';

// const { selectors, firefox } = require('playwright');  // Or 'chromium' or 'webkit'.

// selectors.register('notExist', () => ({
//   // Returns the first element matching given selector in the root's subtree.
//   query(root, selector) {
//     return root.querySelector(selector);
//   },

//   // Returns all elements matching given selector in the root's subtree.
//   queryAll(root, selector) {
//     return Array.from(root.querySelectorAll(selector));
//   }
// });

const config: PlaywrightTestConfig<{ version: string }> = {
  // Look for test files in the "tests" directory, relative to this configuration file
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  outputDir: 'results', // under tests
  preserveOutput: 'always',

  // Each test is given 30 seconds
  timeout: 30000,

  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,

  // Two retries for each test
  retries: 2,

  // Limit the number of workers on CI, use default locally
  workers: process.env.CI ? 2 : undefined,

  globalSetup: './global-setup',

  use: {
    // Browser options
    headless: !!process.env.CI,
    slowMo: 50,

    locale: 'en-GB',

    // Context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: 'on',
    video: 'retry-with-video',
  },

  projects: [
    {
      name: 'all',
      testMatch: '**/*.spec.ts',
      use: {
        // version: '1.1'
      },
    },
    {
      name: 'admin',
      testMatch: 'admin/*.spec.ts',
      use: {
        // version: '1.1'
      },
    },
    {
      name: 'dop',
      testMatch: 'dop/*.spec.ts',
      use: {},
    },
    {
      name: 'cmp',
      testMatch: 'cmp/*.spec.ts',
      use: {},
    },
  ],
};
export default config;

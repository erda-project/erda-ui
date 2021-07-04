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

const getTestMatch = () => {
  const roles = (process.env.TEST_ROLES || '').split(',');
  const dirs: string[] = [];
  if (roles.includes('Admin')) {
    dirs.push('admin');
  }
  if (roles.includes('orgManager')) {
    dirs.push('dop', 'cmp');
  }

  const testDirs = dirs.length > 1 ? `{${dirs.join(',')}}` : dirs;
  return `${testDirs}/*.spec.ts`;
};

const testMatch = getTestMatch();
console.log('>> execute tests:', testMatch);

const config: PlaywrightTestConfig = {
  // Look for test files in the "tests" directory, relative to this configuration file
  testDir: 'tests',
  testMatch,

  // Each test is given 30 seconds
  timeout: 30000,

  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,

  // Two retries for each test
  retries: 0,

  // Limit the number of workers on CI, use default locally
  workers: process.env.CI ? 2 : undefined,

  globalSetup: './global-setup',

  use: {
    // Browser options
    headless: false,
    slowMo: 50,

    locale: 'en-GB',

    // Context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
  },
};
export default config;

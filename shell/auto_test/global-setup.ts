import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import login, { RoleTypes } from './login.spec';
import config from './auth/config';
// const { chromium } = require('playwright');

async function globalSetup() {
  // const userDataDir = './auto_test/auth';
  // const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const browser = await chromium.launch();

  const roles = Object.keys(config.roles) as RoleTypes[];
  const authFiles = fs.readdirSync(path.resolve(__dirname, './auth'));

  const promiseList: Promise<any>[] = [];
  roles.forEach((role) => {
    if (role && !authFiles.includes(`${role}.json`)) {
      promiseList.push(login({ browser, role }));
    }
  });

  await Promise.all(promiseList);
}
export default globalSetup;

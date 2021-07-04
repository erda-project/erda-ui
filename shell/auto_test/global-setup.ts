import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import login, { RoleTypes } from './login.spec';
// const { chromium } = require('playwright');

async function globalSetup() {
  // const userDataDir = './auto_test/auth';
  // const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const browser = await chromium.launch();

  const roles = (process.env.TEST_ROLES || '').split(',') as RoleTypes[];
  const authFiles = fs.readdirSync(path.resolve(__dirname, './auth'));
  console.log('>> execute with roles:', roles);

  const promiseList: Promise<any>[] = [];
  roles.forEach((role) => {
    if (role && !authFiles.includes(`${role}.json`)) {
      console.log(`>> start login as ${role}`);
      promiseList.push(login({ browser, role }));
      console.log('>> login success');
    }
  });

  await Promise.all(promiseList);
}
export default globalSetup;

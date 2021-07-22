// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

const path = require('path');
const { promises: fs } = require('fs');

const copyExternalCode = async () => {
  const mspRootPath = path.resolve(__dirname, '../../../erda-ui-enterprise/msp');
  const targetPath = path.resolve(__dirname, '../app/modules/msp');
  await fs.copyFile(path.resolve(mspRootPath, 'router.js'), path.resolve(targetPath, 'router.js'));
  await copyDir(path.resolve(mspRootPath, 'pages/gateway'), path.resolve(targetPath, 'pages/gateway'));
  await copyDir(path.resolve(mspRootPath, 'pages/config-center'), path.resolve(targetPath, 'pages/config-center'));
  await copyDir(path.resolve(mspRootPath, 'pages/zkproxy'), path.resolve(targetPath, 'pages/zkproxy'));

  const cmpRootPath = path.resolve(__dirname, '../../../erda-ui-enterprise/cmp');
  const cmpTargetPath = path.resolve(__dirname, '../app/modules/cmp');
  await fs.copyFile(path.resolve(cmpRootPath, 'router.js'), path.resolve(cmpTargetPath, 'router.js'));
  await copyDir(path.resolve(cmpRootPath, 'pages/log-query'), path.resolve(cmpTargetPath, 'pages/log-query'));
  await copyDir(
    path.resolve(cmpRootPath, 'pages/log-analyze-rule'),
    path.resolve(cmpTargetPath, 'pages/log-analyze-rule'),
  );

  console.log('copy successfully');
};

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory() ? await copyDir(srcPath, destPath) : await fs.copyFile(srcPath, destPath);
  }
}

copyExternalCode();

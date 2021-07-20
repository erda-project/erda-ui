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
  const codeRootPath = path.resolve(__dirname, '../../../erda-ui-enterprise/gateway');
  const targetPath = path.resolve(__dirname, '../app/modules/msp');
  await fs.copyFile(path.resolve(codeRootPath, 'router.js'), path.resolve(targetPath, 'router.js'));
  await copyDir(path.resolve(codeRootPath, 'pages/gateway'), path.resolve(targetPath, 'pages/gateway'));
  console.log('copy successfully');
};

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ? await copyDir(srcPath, destPath) : await fs.copyFile(srcPath, destPath);
  }
}

copyExternalCode();

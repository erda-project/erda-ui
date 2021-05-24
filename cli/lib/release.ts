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

import child_process from 'child_process';
import dayjs from 'dayjs';
import notifier from 'node-notifier';
import { logInfo, logSuccess, logError } from './util/log';
import { getShellDir, registryDir, checkIsRoot } from './util/env';

const { execSync, spawnSync } = child_process;

const GET_SHA_CMD = 'git rev-parse --short HEAD';

export default async ({ image: baseImage, skip }: { image?: string; skip?: boolean }) => {
  try {
    checkIsRoot();
    const rootDir = process.cwd();
    const isSkip = skip ? '-s' : '';
    const buildProcess = await spawnSync('erda-ui', baseImage ? ['build', '-i', `${baseImage}`, `${isSkip}`] : ['build', `${isSkip}`], { env: process.env, cwd: rootDir, stdio: 'inherit' });

    if (buildProcess.status === 1) {
      process.exit(1);
    }

    const date = dayjs().format('YYYYMMDD');
    const shortSha = await execSync(GET_SHA_CMD);
    const sha = shortSha.toString().replace(/\n/, '');// remove the backmost line feed
    const pJson = require(`${getShellDir()}/package.json`);
    const version = pJson.version.slice(0, -2);
    const tag = `${version}-${date}-${sha}`;// 3.20-2020520-182737976

    const image = `${registryDir}:${tag}`;
    await execSync(`docker build -f local_Dockerfile -t ${image} . || exit 1`, { stdio: 'inherit', cwd: rootDir });
    logSuccess('build success');

    logInfo(`start pushing image to registry:【${registryDir}】`);
    await execSync(`docker push ${image} || exit 1`, { stdio: 'inherit' });


    notifier.notify({
      title: 'Success',
      message: `🎉 Image 【${tag}】 pushed to registry success 🎉`,
    });
    logSuccess(`push success: 【${image}】`);

    logSuccess('docker exited');
  } catch (error) {
    logError('build image error:', error.message);
    process.exit(1);
  }
};


#!/usr/bin/env node
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

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

const inquirer = require('inquirer');
const child_process = require('child_process');
const moment = require('moment');
const pJson = require('../package.json');
const notifier = require('node-notifier');

const { execSync } = child_process;

const GET_BRANCH_CMD = "git branch | awk '/\\*/ { print $2; }'";
const UPDATE_SUB_MODULES = "git pull --recurse-submodules";
const START_DOCKER_CMD = 'open --background -a Docker';
const GET_SHA_CMD = 'git rev-parse --short HEAD';
const CLEAR_CMD = 'rm -rf ./.happypack && rm -rf ./.terser-cache && rm -rf ./public/* && rm -rf ./sourcemap';
const EXIT_DOCKER_CMD = 'osascript -e \'quit app "Docker"\'';

const getCurrentBranch = async () => {
  execSync(UPDATE_SUB_MODULES);
  const branch = await execSync(GET_BRANCH_CMD);
  return branch.toString();
};

const prepare = async () => {
  const branch = await getCurrentBranch();
  console.log('当前分支', branch);
  if (!branch.startsWith('release')) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueBuild',
        message: '当前分支不是release分支，是否继续打包？',
        default: '否',
        choices: ['是', '否'],
      },
    ]);
    if (answer.continueBuild === '否') {
      return Promise.reject(new Error('非release分支, 主动退出!'));
    }
  }
};

const whetherGenerateSourceMap = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'requireSourceMap',
      message: '是否生成sourcemap文件？',
      default: '否',
      choices: ['是', '否'],
    },
  ]);
  return answer.requireSourceMap === '是'
}

const bundlePackage = async () => {
  try {
    await prepare();
    const requireSourceMap = await whetherGenerateSourceMap();

    console.log('启动docker');
    execSync(START_DOCKER_CMD);

    console.log('清除本地缓存...');
    execSync(CLEAR_CMD);

    const checkReInstall = await inquirer.prompt([
      {
        type: 'list',
        name: 'reInstall',
        message: '是否需要更新依赖',
        default: '是',
        choices: ['是', '否'],
      },
    ]);
    const { reInstall } = checkReInstall;
    if (reInstall === '是') {
      console.log('更新依赖...');
      execSync('npm i', { stdio: 'inherit' });
    } else {
      console.log('⚠️ 跳过更新依赖，请确保本地依赖是最新的！⚠️ ');
    }

    const date = moment().format('YYYYMMDD');
    const shortSha = await execSync(GET_SHA_CMD);
    // GET_SHA_CMD 结果有个回车需要去掉
    const sha = shortSha.toString().replace(/\n/, '');
    const mainVersion = pJson.version.slice(0, -2);
    // 3.14-20200520-182737976
    const version = `${mainVersion}-${date}-${sha}`;
    console.log('开始打包版本：', version);

    console.log('开始打包dice镜像');
    const buildCmd = `cross-env-shell NODE_ENV=production ${requireSourceMap ? 'enableSourceMap=true' : ''} 'npm run build-app'`;
    execSync(buildCmd, { stdio: 'inherit' });
    console.log('打包完成!');
    console.log('构建并推送镜像...');
    const image = `registry.cn-hangzhou.aliyuncs.com/terminus/dice-ui:${version}`;
    execSync(`docker build -f local_Dockerfile -t ${image} . || exit 1`, { stdio: 'inherit' });
    execSync(`docker push ${image} || exit 1`, { stdio: 'inherit' });
    process.platform === 'darwin' && execSync(EXIT_DOCKER_CMD);

    notifier.notify({
      title: '亲',
      message: '🎉 构建完成啦 🎉',
    });

    console.log('镜像推送完成：', image);
    const needPublish = await inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: `是否需要更新到Dev(请先复制好版本： ${version})`,
        default: '是',
        choices: ['是', '否'],
      },
    ]);
    const { answer } = needPublish;
    if (answer === '是') {
      console.log('登录dev集群...');
      try {
        execSync(`${__dirname}/../shell/login-ssh.sh`, { stdio: 'inherit' });
      } catch (error) {
        console.log('文件 shell/login-ssh.sh 不存在');
      }
    }

  } catch (error) {
    console.log('打包中断退出, 由于:', error.message);
  }
};

bundlePackage();

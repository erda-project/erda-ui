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

const { forEach } = require('lodash');
const tsconfig = require('./tsconfig.json');
const fs = require('fs');
const path = require('path');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);
const moduleMapper = {};
const excludeModules = ['interface', 'common', 'layout', 'dice-env', 'user', 'configForm', 'charts', 'application'];
forEach(moduleNameMapper, (t, k) => {
  if (!excludeModules.includes(k)) {
    moduleMapper[`^${k}`] = t;
  }
});
const resolve = (pathname) => path.resolve(__dirname, pathname);
const dashboardRealPath = fs.realpathSync(resolve('./node_modules/@erda-ui/dashboard-configurator'));

module.exports = {
  verbose: true,
  automock: false,
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false,
  collectCoverageFrom: [
    'app/common/**/*.{js,jsx,ts,tsx}',
    '!app/common/**/*.d.ts',
    '!app/common/stores/*.{js,jsx,ts,tsx}',
    '!app/common/services/*.{js,jsx,ts,tsx}',
  ],
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
    '^.+\\js$': 'babel-jest',
    // [dashboardRealPath]: 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    ...moduleMapper,
    '^core/agent$': '<rootDir>/../core/src/agent.ts',
    '^core/(.*)': '<rootDir>/../core/src/$1',
    '^cube$': '<rootDir>/../core/src/cube.ts',
    '^i18next$': '<rootDir>/../core/node_modules/i18next',
    '^@terminus/nusi$': '<rootDir>/../core/node_modules/@terminus/nusi/lib/index.js',
    '^@terminus/nusi/dist/.*': '<rootDir>/node_modules/identity-obj-proxy/src/index.js',
    '^antd$': '<rootDir>/../core/node_modules/antd/lib/index.js',
    '^antd/dist/.*': '<rootDir>/node_modules/identity-obj-proxy/src/index.js',
    // temporary config for antd upgrade
    '^antd-latest/dist/.*': '<rootDir>/node_modules/identity-obj-proxy/src/index.js', // must be absolute path
    '^antd-latest/lib/.*': '<rootDir>/node_modules/identity-obj-proxy/src/index.js', // must be absolute path
    '^antd-latest$': '<rootDir>/../core/node_modules/antd-latest/lib/index.js',
    '^nusi$': '<rootDir>/../core/src/nusi/index.tsx',
    i18n: '<rootDir>/app/i18n.ts',
    'app/constants': '<rootDir>/app/constants.ts',
    'app/user/stores(.*)': '<rootDir>/app/user/stores/$1',
    'app/layout/stores(.*)': '<rootDir>/app/layout/stores/$1',
    'app/cube': '<rootDir>/app/cube.ts',
    'app/global-space': '<rootDir>/app/global-space.ts',
    '^agent$': '<rootDir>/app/agent.js',
    '^dice-env$': '<rootDir>/app/external/env.ts',
    '^common$': '<rootDir>/app/common/index.ts',
    '^layout(.*)': '<rootDir>/app/layout/$1',
    '^common/utils(.*)': '<rootDir>/app/common/utils/$1',
    'common/stores(.*)': '<rootDir>/app/common/stores/$1',
    '^configForm(.*)': '<rootDir>/app/configForm/$1',
    '^charts$': '<rootDir>/app/charts/index.js',
    // mock for @erda-ui/dashboard-configuratort iconfont
    'iconfont.js$': 'identity-obj-proxy',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: ['<rootDir>/test/setupJest.ts', '<rootDir>/test/setupEnzyme.ts', 'jest-canvas-mock'],
  setupFilesAfterEnv: ['./node_modules/jest-enzyme/lib/index.js'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  transformIgnorePatterns: [
    // 'node_modules/(?!@erda-ui/dashboard-configurator/.*)',
    // dashboardRealPath,
  ],
  testMatch: ['**/__tests__/**/*.test.+(tsx|ts|jsx|js)'],
  testPathIgnorePatterns: [
    // '/node_modules/',
  ],
  testURL: 'http://localhost',
};

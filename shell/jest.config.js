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

const dirs = ['addon', 'application', 'common', 'dcos', 'layout', 'dataCenter','org' 'platoform', 'project', 'runtime', 'user'];
const moduleMapper = {};
dirs.forEach((dir) => { moduleMapper[`^${dir}(.*)`] = `<rootDir>/app/${dir}$1`; });

module.exports = {
  automock: false,
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    'app/common/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleFileExtensions: [
    'tsx',
    'ts',
    'jsx',
    'js',
  ],
  moduleNameMapper: {
    ...moduleMapper,
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: ['./test/dom.js', './test/helpers.js', 'jest-canvas-mock'],
  setupTestFrameworkScriptFile: 'jest-enzyme',
  testEnvironment: 'node',
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  testMatch: [
    '**/__tests__/*.test.+(tsx|ts|jsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  // transform: {
  //   '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileTransformer.js',
  // },
};

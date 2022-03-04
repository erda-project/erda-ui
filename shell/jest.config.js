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

/** @type {import('ts-jest').InitialOptionsTsJest} */
module.exports = {
  clearMocks: true,
  preset: 'ts-jest/presets/js-with-ts-esm',
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
  moduleDirectories: ['node_modules', 'app'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  collectCoverageFrom: [
    'app/common/**/*.{js,jsx,ts,tsx}',
    '!app/common/**/*.d.ts',
    '!app/common/stores/*.{js,jsx,ts,tsx}',
    '!app/common/test_bak/**/*.{js,jsx,ts,tsx}',
    '!app/common/services/*.{js,jsx,ts,tsx}',
    '!app/common/utils/style-constants.ts',
    '!app/common/constants.ts',
    '!app/common/utils/axios-config.ts',
  ],
  testMatch: ['**/__tests__/**/*.test.+(tsx|ts)'],

  transform: {
    mjs$: 'babel-jest', // 'common/index.ts': 'babel-jest',
    // common$: 'babel-jest',
    // i18n$: 'babel-jest'
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
      tsconfig: 'tsconfig-jest.json',
      diagnostics: false,
      isolatedModules: true,
      useESM: true,
    },
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/extend-expect.ts'],
  setupFiles: ['<rootDir>/test/setupJest.ts'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    'iconfont.js$': 'identity-obj-proxy',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    'app/constants': '<rootDir>/app/constants.ts',
    'app/layout/stores(.*)': '<rootDir>/app/layout/stores/$1',
    'app/menus$': '<rootDir>/app/menus/index.ts',
    'app/theme-color.mjs': '<rootDir>/app/theme-color.mjs',
    'app/org-home/stores/org': '<rootDir>/app/org-home/stores/org.tsx',
    'app/user/stores$': '<rootDir>/app/user/stores/index.ts',
    'cmp/pages/cluster-manage/config': '<rootDir>/app/modules/cmp/pages/cluster-manage/config.tsx',
    'common/constants': '<rootDir>/app/common/constants.ts',
    '(core/agent|agent$)': '<rootDir>/../core/src/agent.ts',
    'core/cube': '<rootDir>/../core/src/cube.ts',
    'core/config': '<rootDir>/../core/src/config.ts',
    'core/event-hub': '<rootDir>/../core/src/utils/event-hub.ts',
    'core/global-space': '<rootDir>/../core/src/utils/global-space.ts',
    'core/service': '<rootDir>/../core/src/service/index.ts',
    'core/stores/route': '<rootDir>/../core/src/stores/route.ts',
    'core/stores/userMap': '<rootDir>/../core/src/stores/user-map.ts',
    'core/stores/loading': '<rootDir>/../core/src/stores/loading.ts',
    'core/utils/ws': '<rootDir>/../core/src/utils/ws.ts',
    'layout/stores/layout': '<rootDir>/app/layout/stores/layout.ts',
    i18n: '<rootDir>/app/i18n.ts',
    '^common/utils(.*)': '<rootDir>/app/common/utils/$1',
    '^common/utils$': '<rootDir>/app/common/utils/index.ts',
    '^app/common/utils(.*)': '<rootDir>/app/common/utils/$1',
    'org/stores/(.*)': '<rootDir>/app/modules/org/stores/$1',
    'user/common$': '<rootDir>/app/user/common/index.ts',
    'user/services/user': '<rootDir>/app/user/services/user.ts',
    'user/stores/permission$': '<rootDir>/app/user/stores/permission.ts',
    'user/stores/(,*)': '<rootDir>/app/user/stores/$1',
    'test/utils': '<rootDir>/test/utils.ts',
  },
  transformIgnorePatterns: [],
};

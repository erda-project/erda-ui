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
const fs = require('fs');
const path = require('path');

const resolve = (pathname) => path.resolve(__dirname, pathname);
const micromark = fs.realpathSync(resolve('./node_modules/micromark'));
module.exports = {
  cache: true,
  clearMocks: true,
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
  moduleDirectories: ['node_modules', 'app'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  collectCoverage: true,
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
  testMatch: ['**/__tests__/**/*.test.+(tsx|ts|jsx|js)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\jsx?$': 'babel-jest',
    mjs$: 'babel-jest',
    'common/index.ts': 'babel-jest',
    i18n$: 'babel-jest',
    'url-invite-modal$': 'babel-jest',
    'common/utils/axios-config$': 'babel-jest',
    [micromark]: 'babel-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig-jest.json',
      diagnostics: false,
      isolatedModules: true,
      useESM: true,
    },
  },
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setupJest.ts'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    'iconfont.js$': 'identity-obj-proxy',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '(core/agent|agent$)': '<rootDir>/../core/src/agent.ts',
    'core/cube': '<rootDir>/../core/src/cube.ts',
    '^cube$': '<rootDir>/../core/src/cube.ts',
    'core/i18n': '<rootDir>/../core/src/i18n',
    'core/event-hub': '<rootDir>/../core/src/utils/event-hub.ts',
    'core/service': '<rootDir>/../core/src/service/index.ts',
    'core/config': '<rootDir>/../core/src/config.ts',
    'core/global-space': '<rootDir>/../core/src/utils/global-space.ts',
    'core/stores/route': '<rootDir>/../core/src/stores/route.ts',
    'core/stores/userMap': '<rootDir>/../core/src/stores/user-map.ts',
    'core/stores/loading': '<rootDir>/../core/src/stores/loading.ts',
    'core/utils/ws': '<rootDir>/../core/src/utils/ws.ts',
    'app/global-space': '<rootDir>/app/global-space.ts',
    'app/theme-color.mjs': '<rootDir>/app/theme-color.mjs',
    'app/constants': '<rootDir>/app/constants.ts',
    'app/charts/theme$': '<rootDir>/app/charts/theme.js',
    'app/config-page/img-map$': '<rootDir>/app/config-page/img-map.ts',
    'app/menus$': '<rootDir>/app/menus/index.ts',
    'app/user/stores$': '<rootDir>/app/user/stores/index.ts',
    'app/layout/stores(.*)': '<rootDir>/app/layout/stores/$1',
    'app/org-home/stores/org': '<rootDir>/app/org-home/stores/org.tsx',
    'application/common/config': '<rootDir>/app/modules/application/common/config.ts',
    '^charts$': '<rootDir>/app/charts/index.js',
    '^charts/utils$': '<rootDir>/app/charts/utils/index.tsx',
    'common/stores/member-scope': '<rootDir>/app/common/stores/member-scope.ts',
    'common/stores/(.*)': '<rootDir>/app/common/stores/$1',
    'common/constants': '<rootDir>/app/common/constants.ts',
    'common/services$': '<rootDir>/app/common/services/index.ts',
    'common/use-hooks$': '<rootDir>/app/common/use-hooks.tsx',
    '^common$': '<rootDir>/app/common/index.ts',
    '^common/utils(.*)': '<rootDir>/app/common/utils/$1',
    '^app/common/utils(.*)': '<rootDir>/app/common/utils/$1',
    'cmp/pages/cluster-manage/config': '<rootDir>/app/modules/cmp/pages/cluster-manage/config.tsx',
    i18n: '<rootDir>/app/i18n.ts',
    'layout/services': '<rootDir>/app/layout/services/index.ts',
    'layout/stores/layout': '<rootDir>/app/layout/stores/layout.ts',
    'org/stores/(.*)': '<rootDir>/app/modules/org/stores/$1',
    'user/common$': '<rootDir>/app/user/common/index.ts',
    'common/components/(.*)': '<rootDir>/app/common/components/$1',
    'user/services/user': '<rootDir>/app/user/services/user.ts',
    'user/stores/permission$': '<rootDir>/app/user/stores/permission.ts',
    'user/stores/(,*)': '<rootDir>/app/user/stores/$1',
  },
  transformIgnorePatterns: [
    // 'node_modules/(?!@erda-ui/dashboard-configurator/.*)',
    // dashboardRealPath,
  ],
};

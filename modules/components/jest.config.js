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

module.exports = {
  clearMocks: true,
  preset: 'ts-jest/presets/js-with-ts-esm',
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
  moduleDirectories: ['node_modules', 'src'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['tsx', 'ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/.umi/**/*',
    '!src/.umi-production/**/*',
    '!src/locale/**/*',
  ],
  testMatch: ['**/__tests__/**/*.test.+(tsx|ts)'],
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
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/extend-expect.ts'],
  setupFiles: ['<rootDir>/__tests__/setupJest.ts'],
  // transformIgnorePatterns: [],
};

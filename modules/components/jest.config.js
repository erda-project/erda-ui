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

module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint-config-ali/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'max-len': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
};

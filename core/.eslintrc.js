module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  globals: {
    Cypress: "readonly",
    cy: "readonly",
  },
  extends: [
    'eslint-config-ali/react',
    'eslint-config-ali/typescript'
  ],
  parser: 'babel-eslint',
  plugins: [
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'import',
    'compat',
    'jsx-a11y',
    'import',
  ],
  parserOptions: {
    ecmaVersion: 2015, // specify the version of ECMAScript syntax you want to use: 2015 => (ES6)
    sourceType: 'module',  // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // enable JSX
      impliedStrict: true // enable global strict mode
    }
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
        moduleDirectory: ['node_modules', 'app', 'router', 'router/modules']
      },
    }
  },
  rules: {
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['draft', 'state'] }],
    'import/prefer-default-export': 'off',
    // 'react/jsx-filename-extension': [2, { 'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/prop-types': 'off',
    'arrow-body-style': 'off',
    'max-len': 'off',
    'no-nested-ternary': 'off',
    'react/no-multi-comp': 'off',
    'jsx-first-prop-new-line': 'off',
    'no-unused-vars': 1,
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'no-console': 2,
    '@typescript-eslint/ban-ts-ignore': 'off'
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint'
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        "@typescript-eslint/no-unused-vars": [1, { "argsIgnorePattern": "^_", "varsIgnorePattern": "^ignored?$" }],
        '@typescript-eslint/interface-name-prefix': 'off',
        'indent': 0,
      }
    }
  ]
};

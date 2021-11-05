const overwriteMap = {
  table: true,
  select: true,
  tag: true,
  'range-picker': true,
};

const overwriteCssMap = {
  table: 'antd/es/table/style',
  select: 'antd/es/select/style',
  tag: false,
  'range-picker': false,
};

// TODO: remove this
const specialNameComponents = {
  'c-r-u-d-table': 'common/components/crud-table',
  'i-f': 'common/components/if',
  'time-selector': 'common/components/monitor',
};

module.exports = {
  sourceType: 'unambiguous', // https://github.com/babel/babel/issues/12731
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // enable polyfill on demand
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    /********************* vite used **********************/
    'jsx-control-statements',
    [
      'import',
      {
        libraryName: 'common',
        customName(name, file) {
          console.log(name);
          return specialNameComponents[name] || `common/components/${name}`;
        },
        style: false,
      },
      'common',
    ],
    [
      'import',
      {
        libraryName: 'app/common',
        customName(name, file) {
          console.log(name);
          return specialNameComponents[name] || `common/components/${name}`;
        },
        style: false,
      },
      'app/common',
    ],
    /********************* vite used **********************/
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false, // default: true
      },
      'lodash',
    ],
    [
      'import',
      {
        libraryName: '@icon-park/react',
        libraryDirectory: 'es/icons',
        camel2DashComponentName: false,
      },
      'iconpark',
    ],
    [
      'import',
      {
        libraryName: 'antd',
        customName(name, file) {
          if (overwriteMap[name]) {
            return `app/antd-overwrite/${name}`;
          }
          return `antd/es/${name}`;
        },
        style(name, file) {
          // name is antd/es/xx
          const match = overwriteCssMap[name.split('/')[2]];
          if (match !== undefined) {
            return match;
          }
          return `${name}/style`;
        },
      },
      'antd',
    ],
    '@babel/transform-runtime', // inject runtime helpers on demand
  ],
};

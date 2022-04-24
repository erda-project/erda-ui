import { defineConfig } from 'dumi';
import { resolve } from 'path';

const title = 'Erda UI Components';
const repo = 'erda-ui-components';

export default defineConfig({
  title,
  favicon: process.env.NODE_ENV === 'production' ? `/${repo}/images/favicon.png` : '/images/favicon.png',
  logo: process.env.NODE_ENV === 'production' ? `/${repo}/images/favicon.png` : '/images/favicon.png',
  outputPath: 'docs-dist',
  mode: 'site',
  hash: true,
  resolve: {
    includes: ['docs', 'src'],
  },
  // Because of using GitHub Pages
  base: `/${repo}/`,
  publicPath: `/${repo}/`,
  alias: {
    src: resolve(__dirname, 'src'),
  },
  navs: [
    null,
    {
      title: 'GitHub',
      path: 'https://github.com/McDaddy/erda-ui-components',
    },
  ],
  extraBabelPlugins: [
    ['babel-plugin-import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
    ['babel-plugin-import', { libraryName: '@formily/antd', libraryDirectory: 'esm', style: true }, '@formily/antd'],
  ],
  // theme: {
  //   '@ant-prefix': 'ec',
  // },
  // webpack5: { lazyCompilation: {} },
  lessLoader: {
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#302647' },
  },
  // more config: https://d.umijs.org/config
});

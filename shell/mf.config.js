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

const config = require('./.erda/config');
const AutomaticVendorFederation = require('@module-federation/automatic-vendor-federation');
const packageJson = require('./package.json');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';
const remotes = {};
const entries = [];
const { DEV_MODULES, PROD_MODULES, SCHEDULER_URL } = config;
const modules = isProd ? PROD_MODULES : DEV_MODULES;

modules.forEach(m => {
  if (m === 'shell') return;
  remotes[m] = isProd ? `mf_${m}@/static/${m}/scripts/mf_${m}.js` : `mf_${m}@${SCHEDULER_URL}/${m}/scripts/mf_${m}.js`;
  if (m !== 'core') {
    entries.push(`${m}: import('${m}/entry'),`);
  }
});

console.log('================ remotes: =================\n', remotes);

fs.writeFileSync('./app/modules.js', `
export default {
  ${entries.join('\n')}
};
`);

module.exports = [
  // {
  //   name: 'mf_nusi',
  //   exposes: {
  //     './all': './app/external/nusi.js',
  //   },
  // },
  {
    name: 'mf_share',
    exposes: {
      './layout/error-page': './app/layout/common/error-page.tsx',
      './layout/stores/layout': './app/layout/stores/layout.ts',
      './layout/entry': './app/layout/entry.js',
      './common/utils': './app/common/utils/index.ts',
      './common/all': './app/common',
      './dataCenter/pages/cluster-manage/operation-history': './app/modules/dataCenter/pages/cluster-manage/operation-history',
      './org/pages/safety': './app/modules/org/pages/safety',
      './user/store': './app/user/stores/index.ts',
      './erda-icon': '@icon-park/react',
      './org-home/stores/org': './app/org-home/stores/org.tsx',
    },
  },
  {
    name: 'main',
    remotes,
    shared: {
      ...AutomaticVendorFederation({
        exclude: ['babel', 'plugin', 'preset', 'webpack', 'loader', 'serve'],
        ignoreVersion: ['react-router-dom', 'react-router-config', 'history'],
        packageJson,
        shareFrom: ['dependencies', 'peerDependencies'],
        ignorePatchVersion: true,
      }),
      react: {
        singleton: true,
        requiredVersion: packageJson.dependencies.react,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: packageJson.dependencies['react-dom'],
      },
      '@icon-park/react': {
        requiredVersion: packageJson.dependencies['@icon-park/react'],
      },
    },
  },

];

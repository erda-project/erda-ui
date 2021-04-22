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

import i18n from 'i18n';

const hostTerminal = {
  path: 'terminal/:host',
  breadcrumbName: i18n.t('dcos:console'),
  getComp: cb => cb(import('dcos/common/containers/terminal')),
};

function getDcosRouter() {
  return [
    {
      path: 'overview',
      breadcrumbName: i18n.t('dcos:org overview'),
      routes: [
        {
          path: ':clusterName',
          mark: 'cluster',
          routes: [
            {
              path: 'overview',
              breadcrumbName: i18n.t('dcos:cluster overview'),
              routes: [
                {
                  path: 'purchase-list',
                  breadcrumbName: i18n.t('dcos:add cloud resources'),
                  routes: [
                    {
                      path: 'add',
                      breadcrumbName: i18n.t('dcos:select machine'),
                      getComp: cb => cb(import('dcos/pages/purchase-resource')),
                    },
                    {
                      getComp: cb => cb(import('dcos/pages/purchase-list')),
                    },
                  ],
                },
                hostTerminal,
                {
                  // getComp: cb => cb(import('dcos/pages/machine-dashboard')),
                },
              ],
            },
          ],
        },
        {
          getComp: cb => cb(import('dcos/pages/cluster-dashboard')),
          layout: {
            noWrapper: true,
          },
        },
      ],
    },
  ];
}

export default getDcosRouter;

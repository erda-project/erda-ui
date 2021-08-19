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

import getMonitorRouter from './monitor/monitor-overview';
import getTopologyRouter from 'msp/monitor/topology';

import i18n from 'i18n';

import wrapper from './pages/wait-wrapper';

const injectWrapper = (route) => {
  route.wrapper = wrapper;
  if (route.routes) {
    route.routes.forEach(injectWrapper);
  }
  return route;
};

function getMspRouter() {
  return [
    {
      path: 'msp',
      mark: 'msp',
      routes: [
        {
          path: 'overview',
          breadcrumbName: i18n.t('msp:microService governance overview'),
          getComp: (cb) => cb(import('msp/pages/micro-service/overview')),
        },
        {
          path: 'projects',
          breadcrumbName: i18n.t('project list'),
          getComp: (cb) => cb(import('msp/pages/micro-service/project-list')),
        },
        injectWrapper({
          path: ':projectId/:env/:tenantGroup',
          breadcrumbName: '{mspProjectName}',
          mark: 'mspDetail',
          routes: [
            getTopologyRouter(),
            {
              path: 'configuration',
              getComp: (cb) => cb(import('msp/pages/configuration')),
            },
            {
              path: 'monitor',
              // breadcrumbName: i18n.t('msp:monitoring platform'),
              // disabled: true,
              routes: [getMonitorRouter()],
            },
            {
              path: 'nodes', // 节点流量管理
              breadcrumbName: i18n.t('msp:node traffic management'),
              keepQuery: true,
              getComp: (cb) => cb(import('msp/pages/zkproxy/node-list')),
            },
            // 注册中心
            {
              path: 'release', // 灰度发布
              breadcrumbName: i18n.t('msp:grayscale release'),
              getComp: (cb) => cb(import('msp/pages/zkproxy/governance')),
            },
            {
              path: 'info/:tenantId?',
              breadcrumbName: i18n.t('msp:component info'),
              layout: { fullHeight: true },
              getComp: (cb) => cb(import('msp/pages/info')),
            },
          ],
        }),
      ],
    },
  ];
}

if (window._master) {
  window._master.registModule('msp', {
    models: [],
    routes: getMspRouter(),
  });
}

export default getMspRouter;

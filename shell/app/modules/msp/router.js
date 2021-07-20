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
          path: 'mspManage',
          breadcrumbName: i18n.t('msp:microService governance'),
          getComp: (cb) => cb(import('msp/pages/micro-service/entry'), 'MspEntry'),
          layout: {
            noWrapper: true,
          },
        },
        injectWrapper({
          path: ':projectId/:env/:tenantGroup',
          mark: 'mspDetail',
          routes: [
            getTopologyRouter(),
            {
              path: 'monitor',
              // breadcrumbName: i18n.t('msp:monitoring platform'),
              // disabled: true,
              routes: [getMonitorRouter()],
            },

            // 日志分析
            {
              path: 'log/:addonId',
              breadcrumbName: i18n.t('log analysis'),
              routes: [
                {
                  path: 'query',
                  breadcrumbName: i18n.t('log query'),
                  layout: { grayBg: true },
                  getComp: (cb) => cb(import('app/modules/cmp/pages/log-query')),
                },
                {
                  path: 'rule',
                  breadcrumbName: i18n.t('analysis rule'),
                  routes: [
                    {
                      path: 'add',
                      breadcrumbName: i18n.t('org:add analysis rule'),
                      getComp: (cb) => cb(import('app/modules/cmp/pages/log-analyze-rule/detail')),
                    },
                    {
                      path: ':ruleId',
                      breadcrumbName: i18n.t('org:edit analysis rule'),
                      getComp: (cb) => cb(import('app/modules/cmp/pages/log-analyze-rule/detail')),
                    },
                    {
                      getComp: (cb) => cb(import('app/modules/cmp/pages/log-analyze-rule')),
                    },
                  ],
                },
              ],
            },

            // 注册中心
            {
              path: 'nodes', // 节点流量管理
              breadcrumbName: i18n.t('msp:node traffic management'),
              keepQuery: true,
              getComp: (cb) => cb(import('msp/pages/zkproxy/node-list')),
            },
            {
              path: 'services', // 服务注册列表
              breadcrumbName: i18n.t('msp:service registration list'),
              alwaysShowTabKey: 'services',
              tabs: [
                { key: 'services', name: i18n.t('msp:dubbo protocol') },
                { key: 'services/http', name: i18n.t('msp:http protocol') },
              ],
              routes: [
                {
                  keepQuery: true,
                  getComp: (cb) => cb(import('msp/pages/zkproxy/zkproxy-list')),
                },
                {
                  path: 'http',
                  tabs: [
                    { key: 'services', name: i18n.t('msp:dubbo protocol') },
                    { key: 'services/http', name: i18n.t('msp:http protocol') },
                  ],
                  alwaysShowTabKey: 'services/http',
                  keepQuery: true,
                  getComp: (cb) => cb(import('msp/pages/zkproxy/http-list')),
                },
                {
                  path: 'interface-detail',
                  getComp: (cb) => cb(import('msp/pages/zkproxy/interface-detail')),
                },
              ],
            },
            {
              path: 'release', // 灰度发布
              breadcrumbName: i18n.t('msp:grayscale release'),
              getComp: (cb) => cb(import('msp/pages/zkproxy/governance')),
            },

            // 网关

            // 配置管理
            {
              path: 'config/:tenantId',
              breadcrumbName: i18n.t('msp:console'),
              getComp: (cb) => cb(import('msp/pages/config-center')),
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

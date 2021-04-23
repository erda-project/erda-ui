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
import getApiInsightRouter from 'api-insight';
import getTopologyRouter from 'microService/monitor/topology';

import i18n from 'i18n';

import wrapper from './pages/wait-wrapper';

const auditTabs = () => {
  return [
    {
      key: 'package-analyze',
      name: i18n.t('microService:endpoint analytics'),
    },
    {
      key: 'consumer-analyze',
      name: i18n.t('microService:consumer analytics'),
    },
    {
      key: 'hotSpot-analyze',
      name: i18n.t('microService:hot spot analytics'),
    },
    {
      key: 'error-analyze',
      name: i18n.t('microService:error insight'),
    },
  ];
};

const auditRoute = {
  path: 'consumer-audit', // 调用审计
  mark: 'consumer-audit',
  routes: [
    {
      path: 'package-analyze',
      tabs: auditTabs,
      ignoreTabQuery: true,
      alwaysShowTabKey: 'package-analyze',
      breadcrumbName: i18n.t('microService:endpoint analytics'),
      getComp: cb => cb(import('microService/pages/gateway/containers/consumer-audit/package-analyze'), 'PackageAnalyze'),
    },
    {
      path: 'consumer-analyze',
      tabs: auditTabs,
      ignoreTabQuery: true,
      alwaysShowTabKey: 'consumer-analyze',
      breadcrumbName: i18n.t('microService:consumer analytics'),
      getComp: cb => cb(import('microService/pages/gateway/containers/consumer-audit/consumer-analyze'), 'ConsumerAnalyze'),
    },
    {
      path: 'hotSpot-analyze',
      tabs: auditTabs,
      ignoreTabQuery: true,
      alwaysShowTabKey: 'hotSpot-analyze',
      breadcrumbName: i18n.t('microService:hot spot analytics'),
      getComp: cb => cb(import('microService/pages/gateway/containers/consumer-audit/hotSpot-analyze'), 'HotSpotAnalyze'),
    },
    {
      path: 'error-analyze',
      tabs: auditTabs,
      ignoreTabQuery: true,
      alwaysShowTabKey: 'error-analyze',
      breadcrumbName: i18n.t('microService:error insight'),
      getComp: cb => cb(import('microService/pages/gateway/containers/consumer-audit/error-analyze'), 'ErrorAnalyze'),
    },
  ],
};

const injectWrapper = (route) => {
  route.wrapper = wrapper;
  if (route.routes) {
    route.routes.forEach(injectWrapper);
  }
  return route;
};

function getMicroServiceRouter() {
  return [
    {
      path: 'microService',
      mark: 'microService',
      routes: [
        {
          path: 'microServiceManage',
          breadcrumbName: i18n.t('microService:microService governance'),
          getComp: cb => cb(import('microService/pages/micro-service/entry'), 'MicroServiceEntry'),
          layout: {
            noWrapper: true,
          },
        },
        injectWrapper({
          path: ':projectId/:env/:tenantGroup',
          mark: 'microServiceDetail',
          routes: [
            getTopologyRouter(),
            {
              path: 'monitor',
              // breadcrumbName: i18n.t('microService:monitoring platform'),
              // disabled: true,
              routes: [
                getMonitorRouter(),
              ],
            },

            // 日志分析
            {
              path: 'log/:addonId',
              breadcrumbName: i18n.t('log analyze'),
              routes: [
                {
                  path: 'query',
                  breadcrumbName: i18n.t('log query'),
                  layout: { grayBg: true },
                  getComp: cb => cb(import('app/modules/dataCenter/pages/log-query')),
                },
                {
                  path: 'rule',
                  breadcrumbName: i18n.t('analyze rule'),
                  routes: [
                    {
                      path: 'add',
                      breadcrumbName: i18n.t('org:add analyze rule'),
                      getComp: cb => cb(import('app/modules/dataCenter/pages/log-analyze-rule/detail')),
                    },
                    {
                      path: ':ruleId',
                      breadcrumbName: i18n.t('org:edit analyze rule'),
                      getComp: cb => cb(import('app/modules/dataCenter/pages/log-analyze-rule/detail')),
                    },
                    {
                      getComp: cb => cb(import('app/modules/dataCenter/pages/log-analyze-rule')),
                    },
                  ],
                },
              ],
            },

            // 注册中心
            {
              path: 'nodes', // 节点流量管理
              breadcrumbName: i18n.t('microService:node traffic manager'),
              keepQuery: true,
              getComp: cb => cb(import('microService/pages/zkproxy/node-list')),
            },
            {
              path: 'services', // 服务注册列表
              breadcrumbName: i18n.t('microService:service registration list'),
              alwaysShowTabKey: 'services',
              tabs: [
                { key: 'services', name: i18n.t('microService:dubbo protocol') },
                { key: 'services/http', name: i18n.t('microService:http protocol') },
              ],
              routes: [
                {
                  keepQuery: true,
                  getComp: cb => cb(import('microService/pages/zkproxy/zkproxy-list')),
                },
                {
                  path: 'http',
                  tabs: [
                    { key: 'services', name: i18n.t('microService:dubbo protocol') },
                    { key: 'services/http', name: i18n.t('microService:http protocol') },
                  ],
                  alwaysShowTabKey: 'services/http',
                  keepQuery: true,
                  getComp: cb => cb(import('microService/pages/zkproxy/http-list')),
                },
                {
                  path: 'interface-detail',
                  getComp: cb => cb(import('microService/pages/zkproxy/interface-detail')),
                },
              ],
            },
            {
              path: 'release', // 灰度发布
              breadcrumbName: i18n.t('microService:grayscale release'),
              getComp: cb => cb(import('microService/pages/zkproxy/governance')),
            },

            // 网关
            {
              path: 'gateway',
              mark: 'gateway-route',
              routes: [
                {
                  path: 'apis', // API管理
                  mark: 'api',
                  breadcrumbName: i18n.t('microService:microService API management'),
                  routes: [
                    {
                      getComp: cb => cb(import('microService/pages/gateway/containers/api')),
                    },
                    getApiInsightRouter(), // API 分析
                  ],
                },
                {
                  path: 'api-package', // 入口流量管理
                  breadcrumbName: i18n.t('microService:endpoints'),
                  routes: [
                    {
                      getComp: cb => cb(import('microService/pages/gateway/containers/api-package'), 'ApiPackage'),
                    },
                    {
                      path: 'create',
                      breadcrumbName: i18n.t('microService:create a endpoint'),
                      getComp: cb => cb(import('microService/pages/gateway/containers/api-package-create')),
                    },
                    auditRoute,
                    {
                      path: ':packageId/edit',
                      breadcrumbName: i18n.t('microService:edit a endpoint'),
                      getComp: cb => cb(import('microService/pages/gateway/containers/api-package-create')),
                    },
                    {
                      path: ':packageId/detail',
                      breadcrumbName: i18n.t('microService:endpoint details'),
                      routes: [
                        {
                          getComp: cb => cb(import('microService/pages/gateway/containers/api-package-detail'), 'ApiPackageDetail'),
                        },
                        {
                          path: 'api-policies', // API 策略
                          breadcrumbName: i18n.t('microService:API policies'),
                          routes: [
                            {
                              path: 'safety-policy',
                              tabs: [
                                { key: 'api-policies/safety-policy', name: i18n.t('microService:security strategy') },
                                { key: 'api-policies/business-policy', name: i18n.t('microService:business strategy') },
                              ],
                              alwaysShowTabKey: 'api-policies/safety-policy',
                              getComp: cb => cb(import('microService/pages/gateway/containers/safety-policy'), 'SafetyPolicy'),
                            },
                            {
                              path: 'business-policy',
                              tabs: [
                                { key: 'api-policies/safety-policy', name: i18n.t('microService:security strategy') },
                                { key: 'api-policies/business-policy', name: i18n.t('microService:business strategy') },
                              ],
                              alwaysShowTabKey: 'api-policies/business-policy',
                              getComp: cb => cb(import('microService/pages/gateway/containers/business-policy'), 'BusinessPolicy'),
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'consumer', // 调用方管理·
                  breadcrumbName: i18n.t('microService:consumer management'),
                  routes: [
                    {
                      getComp: cb => cb(import('microService/pages/gateway/containers/consumer-manage'), 'ConsumerManage'),
                    },
                    auditRoute,
                  ],
                },
                {
                  path: 'old-policies', // 非k8s才用，API策略
                  mark: 'old-policies',
                  breadcrumbName: i18n.t('microService:API policies'),
                  routes: [
                    {
                      path: 'traffic-policy',
                      tabs: [
                        { key: 'api-policies/traffic-policy', name: i18n.t('microService:control strategy') },
                      ],
                      alwaysShowTabKey: 'api-policies/traffic-policy',
                      getComp: cb => cb(import('microService/pages/gateway/containers/traffic-policy'), 'TrafficPolicy'),
                    },
                  ],
                },
                {
                  path: 'old-consumer', // 非k8s时才用，调用者授权
                  breadcrumbName: i18n.t('microService:consumer authorization'),
                  getComp: cb => cb(import('microService/pages/gateway/containers/invoker-authorization')),
                },
              ],
            },

            // 配置管理
            {
              path: 'config/:tenantId',
              breadcrumbName: i18n.t('microService:console'),
              getComp: cb => cb(import('microService/pages/config-center')),
            },
            {
              path: 'info/:tenantId?',
              breadcrumbName: i18n.t('microService:component info'),
              layout: { fullHeight: true },
              getComp: cb => cb(import('microService/pages/info')),
            },
          ],
        }),
      ],
    },
  ];
}

if (window._master) {
  window._master.registModule('microService', {
    models: [],
    routes: getMicroServiceRouter(),
  });
}

export default getMicroServiceRouter;

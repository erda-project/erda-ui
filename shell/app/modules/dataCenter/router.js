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

import getDcosRouter from 'dcos/router';
import i18n from 'i18n';
import { map } from 'lodash';
import { ticketTabs } from 'application/pages/ticket';
import { mqTabs } from 'dcos/pages/service-manager/mq-manager/index';
import { redisTabs } from 'dcos/pages/service-manager/redis-manager/index';
import { rdsTabs } from 'dcos/pages/service-manager/rds-manager/index';

export const getOrgProjectTabs = () => [
  {
    key: 'member',
    name: i18n.t('org:member management'),
  },
];

const configMapTabs = [
  { key: 'base', name: i18n.t('dataCenter:basic information') },
  { key: 'detail', name: i18n.t('detail') },
];

const middlewareTabs = [
  { key: 'monitor', name: i18n.t('monitor detail') },
  { key: 'resource', name: i18n.t('resource detail') },
  { key: 'detail', name: i18n.t('basic information') },
];

const clusterDetailTabs = [
  { key: 'detail', name: i18n.t('basic information') },
  { key: 'state', name: i18n.t('dcos:cluster state') },
];

const kubernetesTabs = [
  { key: 'base', name: i18n.t('dataCenter:basic information') },
  { key: 'pod', name: i18n.t('dataCenter:related pod information') },
  { key: 'detail', name: i18n.t('detail') },
];


function getDataCenterRouter() {
  return [
    {
      path: 'dataCenter',
      mark: 'dataCenter',
      routes: [
        ...getDcosRouter(),
        {
          path: 'clusters',
          breadcrumbName: i18n.t('org:cluster management'),
          routes: [
            {
              path: 'addCluster',
              pageName: i18n.t('org:cluster deployment'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/cluster-manage/deploy-cluster')),
            },
            {
              path: 'history',
              pageName: i18n.t('org:operation history'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/cluster-manage/operation-history'), 'OperationHistory'),
            },
            {
              path: ':clusterName',
              routes: [
                {
                  path: 'detail',
                  tabs: clusterDetailTabs,
                  breadcrumbName: ({ params }) => {
                    const { clusterName } = params || {};
                    return `${i18n.t('cluster detail')}${clusterName ? `(${clusterName})` : ''}`;
                  },
                  routes: [
                    {
                      getComp: cb => cb(import('app/modules/dataCenter/pages/cluster-manage/cluster-detail')),
                    },
                  ],
                },
                {
                  path: 'state',
                  tabs: clusterDetailTabs,
                  breadcrumbName: ({ params }) => {
                    const { clusterName } = params || {};
                    return `${i18n.t('cluster detail')}${clusterName ? `(${clusterName})` : ''}`;
                  },
                  layout: { fullHeight: true },
                  routes: [
                    {
                      getComp: cb => cb(import('app/modules/dataCenter/pages/cluster-manage/cluster-state')),
                    },
                  ],
                },
                {
                  path: 'mount',
                  mark: 'dataCenter', // 侧边栏使用dataCenter的菜单
                  breadcrumbName: i18n.t('org:physical cluster'),
                  routes: [
                    {
                      getComp: cb => cb(import('dcos/pages/mount-list/mount-list')),
                    },
                    {
                      path: 'add',
                      breadcrumbName: i18n.t('org:select resources'),
                      getComp: cb => cb(import('dcos/pages/purchase-cluster/purchase-cluster')),
                    },
                  ],
                },
                {
                  path: 'biCharts',
                  mark: 'biCharts',
                  routes: [
                    {
                      path: ':chartUniqId',
                      mark: 'clusterAlarmReport',
                      routes: [
                        {
                          path: ':processId',
                          breadcrumbName: i18n.t('org:process details'),
                          getComp: cb => cb(import('dcos/pages/alarm-report/processDetail')),
                        },
                        {
                          breadcrumbName: i18n.t('org:alarm data report'),
                          getComp: cb => cb(import('dcos/pages/alarm-report')),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              getComp: cb => cb(import('app/modules/dataCenter/pages/cluster-manage')),
            },
          ],
        },
        {
          path: 'domain',
          breadcrumbName: i18n.t('runtime:manage domain'),
          getComp: cb => cb(import('app/modules/dataCenter/pages/domain-manage')),
        },
        {
          path: 'services',
          breadcrumbName: i18n.t('services'),
          getComp: cb => cb(import('dcos/pages/service-manager')),
        },
        {
          path: 'jobs',
          breadcrumbName: i18n.t('org:jobs'),
          getComp: cb => cb(import('app/modules/dataCenter/pages/tasks/job')),
        },
        {
          path: 'report',
          breadcrumbName: i18n.t('O & M report'),
          routes: [
            {
              path: ':taskId',
              breadcrumbName: '{opReportName}',
              layout: { fullHeight: true },
              getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-report/report-records')),
            },
            {
              getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-report')),
            },
          ],
        },
        {
          path: 'customDashboard',
          breadcrumbName: i18n.t('org:O & M dashboard'),
          routes: [
            {
              path: 'add',
              breadcrumbName: i18n.t('org:new O & M dashboard'),
              layout: { fullHeight: true },
              getComp: cb => cb(import('dataCenter/pages/alarm-report/custom-dashboard/custom-dashboard')),
            },
            {
              path: ':dashboardId',
              breadcrumbName: '{dashboardName}',
              layout: { fullHeight: true },
              getComp: cb => cb(import('dataCenter/pages/alarm-report/custom-dashboard/custom-dashboard')),
            },
            {
              getComp: cb => cb(import('dataCenter/pages/alarm-report/custom-dashboard')),
            },
          ],
        },
        {
          path: 'addon',
          routes: [
            {
              breadcrumbName: i18n.t('addon service'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/middleware-dashboard')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: ':instanceId',
              breadcrumbName: i18n.t('addon detail'),
              routes: [
                {
                  path: 'monitor',
                  tabs: middlewareTabs,
                  alwaysShowTabKey: 'monitor',
                  getComp: cb => cb(import('dataCenter/pages/middleware-detail/monitor')),
                },
                {
                  path: 'resource',
                  tabs: middlewareTabs,
                  alwaysShowTabKey: 'resource',
                  getComp: cb => cb(import('app/modules/dataCenter/pages/middleware-detail/resource')),
                },
                {
                  path: 'detail',
                  tabs: middlewareTabs,
                  alwaysShowTabKey: 'detail',
                  getComp: cb => cb(import('app/modules/dataCenter/pages/middleware-detail/detail')),
                },
              ],
            },
          ],
        },
        {
          path: 'cloudSource',
          breadcrumbName: i18n.t('cloud source'),
          routes: [
            {
              getComp: cb => cb(import('app/modules/dataCenter/pages/cloud-source')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'accounts',
              breadcrumbName: i18n.t('cloud accounts'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/cloud-accounts')),
            },
            {
              path: 'ecs',
              breadcrumbName: 'ECS',
              getComp: cb => cb(import('app/modules/dataCenter/pages/computing/ecs')),
            },
            {
              path: 'vpc',
              breadcrumbName: 'VPC',
              routes: [
                {
                  getComp: cb => cb(import('app/modules/dataCenter/pages/networks/vpc')),
                },
                {
                  path: ':vpcID',
                  routes: [
                    {
                      path: 'vsw',
                      breadcrumbName: 'vsw({params.vpcID})',
                      getComp: cb => cb(import('app/modules/dataCenter/pages/networks/vsw')),
                    },
                  ],
                },
              ],
            },
            {
              path: 'oss',
              breadcrumbName: 'OSS',
              getComp: cb => cb(import('app/modules/dataCenter/pages/storage/oss')),
            },
            {
              path: 'mq',
              breadcrumbName: 'MQ',
              routes: [
                {
                  getComp: cb => cb(import('dcos/pages/service-manager/mq')),
                },
                {
                  path: ':mqID/:tabKey',
                  getComp: cb => cb(import('dcos/pages/service-manager/mq-manager/index')),
                  breadcrumbName: '{params.mqID}',
                  tabs: map(mqTabs),
                },
              ],
            },
            {
              path: 'rds',
              breadcrumbName: 'RDS',
              routes: [
                {
                  getComp: cb => cb(import('dcos/pages/service-manager/rds')),
                },
                {
                  path: ':rdsID/:tabKey',
                  getComp: cb => cb(import('dcos/pages/service-manager/rds-manager/index')),
                  breadcrumbName: '{params.rdsID}',
                  tabs: map(rdsTabs),
                },
              ],
            },
            {
              path: 'redis',
              breadcrumbName: 'Redis',
              routes: [
                {
                  getComp: cb => cb(import('dcos/pages/service-manager/redis')),
                },
                {
                  path: ':redisID/:tabKey',
                  getComp: cb => cb(import('dcos/pages/service-manager/redis-manager/index')),
                  breadcrumbName: '{params.redisID}',
                  tabs: map(redisTabs),
                },
              ],
            },
          ],
        },
        {
          path: 'ticket/:ticketType',
          breadcrumbName: i18n.t('application:tickets'),
          tabs: ticketTabs,
          routes: [
            {
              getComp: cb => cb(import('app/modules/org/pages/ticket')),
            },
            {
              path: ':ticketId',
              breadcrumbName: i18n.t('application:ticket detail'),
              getComp: cb => cb(import('app/modules/org/pages/ticket/ticket-detail')),
            },
          ],
        },
        {
          path: 'log',
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
        {
          path: 'alarm',
          routes: [
            {
              path: 'report',
              routes: [
                {
                  path: ':clusterName',
                  routes: [
                    {
                      path: ':chartUniqId',
                      routes: [
                        {
                          path: ':processId',
                          breadcrumbName: i18n.t('process detail'),
                          getComp: cb => cb(import('dcos/pages/alarm-report/processDetail')),
                        },
                        {
                          breadcrumbName: i18n.t('alarm data report'),
                          getComp: cb => cb(import('dcos/pages/alarm-report')),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'record',
              breadcrumbName: i18n.t('alarm record'),
              routes: [
                {
                  path: ':recordId',
                  breadcrumbName: '{alarmRecordName}',
                  getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-record/detail')),
                },
                {
                  getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-record')),
                },
              ],
            },
            {
              path: 'statistics',
              breadcrumbName: i18n.t('alarm statistics'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-analyze')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'strategy',
              breadcrumbName: i18n.t('alarm strategy'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/alarm-strategy')),
            },
            {
              path: 'custom',
              breadcrumbName: i18n.t('custom alarm'),
              routes: [
                {
                  path: ':dashboardId',
                  breadcrumbName: '{dashboardName}',
                  layout: { fullHeight: true },
                  getComp: cb => cb(import('dataCenter/pages/alarm-report/custom-dashboard/custom-dashboard')),
                },
                {
                  getComp: cb => cb(import('app/modules/dataCenter/pages/custom-alarm')),
                },
              ],
            },
            {
              path: 'pod',
              breadcrumbName: i18n.t('pod detail'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/pod-detail')),
            },
            {
              path: 'middleware-chart',
              breadcrumbName: i18n.t('middleware chart'),
              getComp: cb => cb(import('app/modules/dataCenter/pages/middleware-chart')),
            },
          ],
        },
      ],
    },
  ];
}

export default getDataCenterRouter;

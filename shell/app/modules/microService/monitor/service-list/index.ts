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


const tabs = [
  { key: 'overview', name: i18n.t('common:service') },
  { key: 'transaction', name: i18n.t('microService:affairs') },
  { key: 'anomaly', name: i18n.t('abnormal') },
  { key: 'process', name: i18n.t('dcos:process') },
];

export default () => ({
  path: 'service-list',
  breadcrumbName: i18n.t('microService:service list'),
  routes: [
    {
      path: ':applicationId',
      routes: [
        {
          path: ':serviceId',
          routes: [
            {
              path: ':serviceName',
              breadcrumbName: ({ params }: any) => {
                const { serviceName } = params || {};
                return `${i18n.t('microService:service analysis')}-${serviceName}`;
              },
              tabs,
              alwaysShowTabKey: 'overview',
              layout: { fullHeight: true },
              routes: [
                {
                  path: 'overview',
                  tabs,
                  layout: { fullHeight: true },
                  getComp: (cb: any) => cb(import('microService/monitor/service-list/pages/overview')),
                },
                {
                  path: 'transaction',
                  tabs,
                  layout: { fullHeight: true },
                  getComp: (cb: any) => cb(import('microService/monitor/service-list/pages/transaction')),
                },
                {
                  path: 'anomaly',
                  tabs,
                  layout: { fullHeight: true },
                  getComp: (cb: any) => cb(import('microService/monitor/service-list/pages/anomaly')),
                },
                {
                  path: 'process',
                  tabs,
                  layout: { fullHeight: true },
                  getComp: (cb: any) => cb(import('microService/monitor/service-list/pages/process')),
                },
                {
                  layout: { fullHeight: true },
                  getComp: (cb: any) => cb(import('microService/monitor/service-list/pages/overview')),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // layout: { fullHeight: true },
      getComp: (cb: any) => cb(import('microService/monitor/service-list/pages')),
    },
  ],
});

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

import getProjectRouter from 'project/router';
import getPublisherRouter from 'publisher/router';
import getApiManagePlatformRouter from 'apiManagePlatform/router';
import i18n from 'i18n';

const publisherTabs = () => {
  return [
    {
      key: 'MOBILE',
      name: i18n.t('dop:Mobile app'),
    },
    {
      key: 'LIBRARY',
      name: i18n.t('dop:Library/Module'),
    },
  ];
};

const approvalTabs = [
  {
    key: 'pending',
    name: i18n.t('cmp:pending approval'),
  },
  {
    key: 'approved',
    name: i18n.t('cmp:Approved'),
  },
];

const initiateTabs = [
  {
    key: 'WaitApprove',
    name: i18n.t('cmp:pending approval'),
  },
  {
    key: 'Accept',
    name: i18n.t('Approved'),
  },
  {
    key: 'Reject',
    name: i18n.t('Rejected-approval'),
  },
];

export default function getDopRouter(): RouteConfigItem[] {
  return [
    {
      path: 'dop',
      mark: 'dop',
      toMark: 'orgIndex',
      routes: [
        {
          path: 'approval',
          pageName: i18n.t('dop:deployment request'),
          mark: 'approval',
          routes: [
            {
              path: 'my-approve/:approvalType',
              breadcrumbName: i18n.t('dop:my approval'),
              tabs: approvalTabs,
              ignoreTabQuery: true,
              routes: [
                {
                  getComp: (cb) => cb(import('application/pages/deploy-list/approve')),
                  layout: {
                    noWrapper: true,
                  },
                },
              ],
            },
            {
              path: 'my-initiate/:initiateType',
              breadcrumbName: i18n.t('dop:Initiated by me'),
              tabs: initiateTabs,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('application/pages/deploy-list/initiate')),
              layout: {
                noWrapper: true,
              },
            },
          ],
        },
        {
          path: 'projects',
          breadcrumbName: i18n.t('dop:projects'),
          layout: { noWrapper: true },
          getComp: (cb) => cb(import('dop/pages/projects/project-list-protocol')),
        },
        {
          path: 'publisher',
          breadcrumbName: i18n.t('publisher:my release'),
          routes: [
            {
              getComp: (cb) => cb(import('dop/pages/publisher'), 'RedirectTo'),
            },
            {
              path: ':mode',
              tabs: publisherTabs,
              routes: [
                {
                  getComp: (cb) => cb(import('dop/pages/publisher')),
                  layout: {
                    noWrapper: true,
                  },
                },
                ...getPublisherRouter(),
              ],
            },
          ],
        },
        {
          path: 'addonsManage',
          routes: [
            {
              path: ':projectId/:insId',
              mark: 'addonsManage',
              routes: [
                {
                  path: 'overview',
                  breadcrumbName: i18n.t('dop:addon info'),
                  getComp: (cb) => cb(import('addonPlatform/pages/addon-resource/addon-resource')),
                },
                {
                  path: 'settings',
                  breadcrumbName: i18n.t('dop:addon setting'),
                  getComp: (cb) => cb(import('common/components/addon-settings')),
                },
                {
                  path: 'mysql-settings',
                  routes: [
                    {
                      path: 'account',
                      breadcrumbName: i18n.t('cmp:database account'),
                      getComp: (cb) => cb(import('addonPlatform/pages/mysql/account')),
                    },
                    {
                      path: 'consumer',
                      breadcrumbName: i18n.t('dop:consumer manager'),
                      getComp: (cb) => cb(import('addonPlatform/pages/mysql/consumer')),
                    },
                  ],
                },
                // {
                //   path: 'log-analytics',
                //   breadcrumbName: i18n.t('Console'),
                //   getComp: cb => cb(import('msp/pages/log-analytics')),
                // },
                {
                  path: 'jvm-profiler',
                  routes: [
                    {
                      breadcrumbName: i18n.t('Console'),
                      getComp: (cb) => cb(import('addonPlatform/pages/jvm-profiler/analysis')),
                    },
                    {
                      path: ':profileId',
                      breadcrumbName: i18n.t('dop:JVM analysis'),
                      getComp: (cb) => cb(import('addonPlatform/pages/jvm-profiler/jvm-overview')),
                    },
                  ],
                },
              ],
            },
          ],
        },
        ...getProjectRouter(),
        {
          path: 'form-editor',
          breadcrumbName: 'form-editor',
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('dop/pages/form-editor')),
        },
        {
          path: 'form-test',
          breadcrumbName: 'form-test',
          getComp: (cb) => cb(import('app/configForm/nusi-form/form-test')),
        },
        ...getApiManagePlatformRouter(),
        {
          path: 'mock',
          pageName: '动态界面测试',
          layout: { noWrapper: true },
          getComp: (cb) => cb(import('app/config-page/mock/mock')),
        },
        {
          path: 'gallery',
          pageName: '组件库',
          layout: { noWrapper: true },
          getComp: (cb) => cb(import('app/config-page/mock/gallery')),
        },
        {
          path: 'debug',
          pageName: '组件化协议调试',
          layout: { noWrapper: true, hideSidebar: true },
          getComp: (cb) => cb(import('config-page/debug')),
        } as RouteConfigItem,
      ],
    },
    {
      path: 'perm',
      toMark: 'orgIndex',
      pageName: i18n.t('role permissions description'),
      layout: { hideSidebar: true, fullHeight: true },
      getComp: (cb) => cb(import('user/common/perm-editor/perm-editor'), 'PermEditor'),
    },
  ];
}

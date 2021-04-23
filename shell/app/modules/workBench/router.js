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
import { publisherTabs } from 'app/modules/workBench/pages/publisher/index.tsx';
import getApiManagePlatformRouter from 'apiManagePlatform/router';
import i18n from 'i18n';

const approvalTabs = [
  {
    key: 'pending',
    name: i18n.t('org:to be approved'),
  },
  {
    key: 'approved',
    name: i18n.t('org:approved'),
  },
];

const initiateTabs = [
  {
    key: 'WaitApprove',
    name: i18n.t('org:to be approved'),
  },
  {
    key: 'Accept',
    name: i18n.t('approval passed'),
  },
  {
    key: 'Reject',
    name: i18n.t('approval denied'),
  },
];

export default function getWorkBenchRouter() {
  return [
    {
      path: 'workBench',
      mark: 'workBench',
      routes: [
        {
          path: 'approval',
          pageName: i18n.t('workBench:deployment request'),
          mark: 'approval',
          routes: [
            {
              path: 'my-approve/:approvalType',
              breadcrumbName: i18n.t('workBench:my approval'),
              tabs: approvalTabs,
              ignoreTabQuery: true,
              routes: [
                {
                  getComp: cb => cb(import('application/pages/deploy-list/approve')),
                },
              ],
            },
            {
              path: 'my-initiate/:initiateType',
              breadcrumbName: i18n.t('workBench:my initiated'),
              tabs: initiateTabs,
              ignoreTabQuery: true,
              getComp: cb => cb(import('application/pages/deploy-list/initiate')),
            },
          ],
        },
        {
          path: 'apps',
          breadcrumbName: i18n.t('joined apps'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('application/common/app-list-protocol'), 'MyAppList'),
        },
        {
          path: 'projects',
          pageName: i18n.t('joined projects'),
          breadcrumbName: i18n.t('joined projects'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('app/modules/workBench/pages/projects/project-list-protocol'), 'ProjectList'),
        },
        {
          path: 'service',
          breadcrumbName: i18n.t('addon service'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('app/modules/workBench/pages/addons/addon-category'), 'AddonCategory'),
        },
        {
          path: 'publisher',
          breadcrumbName: i18n.t('publisher:joined publisher'),
          routes: [
            {
              getComp: cb => cb(import('app/modules/workBench/pages/publisher'), 'RedirectTo'),
            },
            {
              path: ':mode',
              tabs: publisherTabs,
              routes: [
                {
                  getComp: cb => cb(import('app/modules/workBench/pages/publisher')),
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
                  breadcrumbName: i18n.t('workBench:addon info'),
                  getComp: cb => cb(import('common/containers/addon-resource')),
                },
                {
                  path: 'settings',
                  breadcrumbName: i18n.t('workBench:addon setting'),
                  getComp: cb => cb(import('common/components/addon-settings'), 'AddonSettings'),
                },
                // {
                //   path: 'log-analytics',
                //   breadcrumbName: i18n.t('workBench:console'),
                //   keepQuery: true,
                //   getComp: cb => cb(import('microService/pages/log-analytics')),
                // },
                {
                  path: 'jvm-profiler',
                  routes: [
                    {
                      breadcrumbName: i18n.t('workBench:console'),
                      keepQuery: true,
                      getComp: cb => cb(import('addonPlatform/pages/jvm-profiler/analysis')),
                    },
                    {
                      path: ':profileId',
                      breadcrumbName: i18n.t('workBench:jvm profiler'),
                      keepQuery: true,
                      getComp: cb => cb(import('addonPlatform/pages/jvm-profiler/jvm-overview')),
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
          getComp: cb => cb(import('workBench/pages/form-editor')),
        },
        {
          path: 'form-test',
          breadcrumbName: 'form-test',
          getComp: cb => cb(import('app/configForm/nusi-form/form-test')),
        },
        ...getApiManagePlatformRouter(),
        {
          path: 'mock',
          pageName: '动态界面测试',
          // layout: { showSubSidebar: false, fullHeight: true },
          getComp: cb => cb(import('app/config-page/mock')),
        },
        {
          path: 'debug',
          pageName: '组件化协议调试',
          layout: { noWrapper: true },
          getComp: cb => cb(import('config-page/debug')),
        },
      ],
    },
    {
      path: 'perm',
      pageName: i18n.t('role permissions description'),
      layout: { showSubSidebar: false, fullHeight: true },
      getComp: cb => cb(import('user/common/perm-editor/perm-editor'), 'PermEditor'),
    },
  ];
}

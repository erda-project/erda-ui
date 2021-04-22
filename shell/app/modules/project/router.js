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

import getAppRouter from 'application/router';
import i18n from 'i18n';
import { PROJECT_TABS, TEST_TABS, DATABANK_TABS, ITERATION_DETAIL_TABS } from './tabs';

function getProjectRouter() {
  return [
    {
      path: 'projects/:projectId',
      breadcrumbName: '{projectName}',
      mark: 'project',
      routes: [
        {
          path: 'apps',
          breadcrumbName: i18n.t('project:applications'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('project/pages/apps/app-list'), 'ProjectAppList'),
        },
        {
          path: 'apps/createApp',
          breadcrumbName: i18n.t('add application'),
          getComp: cb => cb(import('project/pages/apps/app-form')),
        },
        {
          path: 'dashboard',
          routes: [
            {
              breadcrumbName: i18n.t('project:project dashboard'),
              getComp: cb => cb(import('project/pages/dashboard'), 'ProjectDashboard'),
              layout: {
                fullHeight: true,
              },
            },
          ],
        },
        {
          path: 'issues',
          mark: 'issues',
          breadcrumbName: i18n.t('project:project collaboration'),
          routes: [
            {
              path: 'all',
              tabs: PROJECT_TABS,
              keepTabQuery: ['viewType', 'viewGroup', 'iterationIDs'],
              getComp: cb => cb(import('project/pages/issue/all')),
              layout: {
                noWrapper: true,
                fullHeight: true,
              },
            },
            {
              path: 'requirement',
              tabs: PROJECT_TABS,
              keepTabQuery: ['viewType', 'viewGroup', 'iterationIDs'],
              getComp: cb => cb(import('project/pages/issue/requirement')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'task',
              tabs: PROJECT_TABS,
              keepTabQuery: ['viewType', 'viewGroup', 'iterationIDs'],
              getComp: cb => cb(import('project/pages/issue/task')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'bug',
              tabs: PROJECT_TABS,
              keepTabQuery: ['viewType', 'viewGroup', 'iterationIDs'],
              getComp: cb => cb(import('project/pages/issue/bug')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'backlog',
              tabs: PROJECT_TABS,
              layout: { noWrapper: true, fullHeight: true },
              getComp: cb => cb(import('project/pages/backlog')),
            },
            {
              path: 'iteration',
              tabs: PROJECT_TABS,
              routes: [
                {
                  tabs: PROJECT_TABS,
                  getComp: cb => cb(import('project/pages/iteration/table'), 'Iteration'),
                },
                {
                  path: ':iterationId/:issueType',
                  mark: 'iterationDetail',
                  keepTabQuery: ['viewType', 'viewGroup', 'iterationIDs'],
                  tabs: ITERATION_DETAIL_TABS,
                  getComp: cb => cb(import('project/pages/issue/')),
                  layout: {
                    noWrapper: true,
                  },
                },
              ],
            },
            {
              path: 'milestone',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: cb => cb(import('project/pages/milestone'), 'Milestone'),
              layout: { noWrapper: true, fullHeight: true },
            },
          ],
        },
        {
          path: 'ticket',
          breadcrumbName: i18n.t('project:ticket list'),
          getComp: cb => cb(import('project/pages/ticket')),
        },
        {
          path: 'data-bank',
          breadcrumbName: i18n.t('project:data bank'),
          routes: [
            {
              path: 'data-source',
              tabs: DATABANK_TABS,
              layout: { fullHeight: true },
              getComp: cb => cb(import('project/pages/data-source')),
            },
            {
              path: 'config-sheet',
              tabs: DATABANK_TABS,
              layout: { fullHeight: true },
              getComp: cb => cb(import('project/pages/config-sheet')),
            },
          ],
        },
        {
          path: 'pipelines',
          breadcrumbName: i18n.t('pipeline'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('project/pages/pipelines')),
        },
        {
          path: 'testCase',
          pageName: i18n.t('project:test case'),
          routes: [
            {
              path: 'manual',
              tabs: TEST_TABS,
              layout: { fullHeight: true },
              ignoreTabQuery: true,
              pageName: i18n.t('project:test case'),
              getComp: cb => cb(import('project/pages/test-manage/case/manual-test')),
            },
            {
              path: 'auto',
              tabs: TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('project:test case'),
              routes: [
                {
                  tabs: [], // 切换 tab 时，仍需进行鉴权，且不显示 tabs
                  getComp: cb => cb(import('project/pages/auto-test/index')),
                },
                {
                  path: ':spaceId/scenes',
                  mark: 'autoTestSpaceDetail',
                  breadcrumbName: '场景集合({testSpaceName})',
                  routes: [
                    // TODO @zxj: 暂时保留，3.22可能启用
                    // {
                    //   path: 'apis',
                    //   layout: { fullHeight: true },
                    //   ignoreTabQuery: true,
                    //   tabs: AUTO_TEST_SPACE_TABS,
                    //   getComp: cb => cb(import('project/pages/auto-test/apis')),
                    // },
                    {
                      // path: 'scenes',
                      // ignoreTabQuery: true,
                      // tabs: AUTO_TEST_SPACE_TABS,
                      layout: { fullHeight: true },
                      getComp: cb => cb(import('project/pages/auto-test/scenes')),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: 'testPlan',
          pageName: i18n.t('project:test plan'),
          // ignoreTabQuery: true,
          routes: [
            {
              path: 'auto',
              tabs: TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('project:test plan'),
              routes: [
                {
                  tabs: [], // 切换 tab 时，仍需进行鉴权，且不显示 tabs
                  // breadcrumbName: i18n.t('project:auto test'),
                  getComp: cb => cb(import('project/pages/test-plan/test-plan-protocol')),
                },
                {
                  path: ':testPlanId',
                  tabs: [], // 切换 tab 时，仍需进行鉴权，且不显示 tabs
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('project:plan details'),
                  getComp: cb => cb(import('project/pages/test-plan/auto-test-plan-detail')),
                },
              ],
            },
            {
              path: 'manual',
              tabs: TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('project:test plan'),
              routes: [
                {
                  tabs: [], // 切换 tab 时，仍需进行鉴权，且不显示 tabs
                  // breadcrumbName: i18n.t('project:manual test'),
                  getComp: cb => cb(import('project/pages/test-plan')),
                },
                {
                  path: ':testPlanId',
                  tabs: [], // 切换 tab 时，仍需进行鉴权，且不显示 tabs
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('project:plan details'),
                  getComp: cb => cb(import('project/pages/test-plan/test-plan-detail')),
                },
              ],
            },
          ],
        },
        {
          path: 'testEnv/:testType',
          tabs: TEST_TABS,
          getComp: cb => cb(import('project/pages/test-env/test-env')),
          // routes: [
          //   {
          //     path: '',
          //     alwaysShowTabKey: 'testEnv',
          //     getComp: cb => cb(import('project/pages/test-env/test-env')),
          //     tabs: TEST_TABS,
          //   },
          //   {
          //     path: ':tabKey',
          //     alwaysShowTabKey: 'testEnv/:auto',
          //     getComp: cb => cb(import('project/pages/test-env/test-env')),
          //     tabs: TEST_TABS,
          //   },
          // ],
        },
        {
          path: 'service',
          breadcrumbName: i18n.t('addon service'),
          layout: { fullHeight: true },
          getComp: cb => cb(import('project/pages/addon/addon-category'), 'AddonCategory'),
        },
        {
          path: 'resource',
          breadcrumbName: i18n.t('resource summary'),
          getComp: cb => cb(import('project/pages/resource')),
        },
        {
          path: 'setting',
          breadcrumbName: `${i18n.t('project setting')}`,
          layout: { fullHeight: true },
          getComp: cb => cb(import('project/pages/settings')),
        },
        getAppRouter(),
        {
          path: 'perm',
          pageName: i18n.t('role permissions description'),
          layout: { showSubSidebar: false, fullHeight: true },
          getComp: cb => cb(import('user/common/perm-editor/perm-editor'), 'PermEditor'),
        },
        // {
        //   path: 'auto-test',
        //   pageName: '自动化测试组件化协议',
        //   layout: { fullHeight: true },
        //   getComp: cb => cb(import('project/pages/auto-test')),
        // },
      ],
    },
  ];
}

export default getProjectRouter;

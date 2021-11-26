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
import { PROJECT_TABS, AUTO_TEST_TABS, MANUAL_TEST_TABS, ITERATION_DETAIL_TABS, TEST_STATISTICS_TABS } from './tabs';

function getProjectRouter(): RouteConfigItem[] {
  return [
    {
      path: 'projects/:projectId',
      breadcrumbName: '{projectName}',
      mark: 'project',
      routes: [
        {
          path: 'apps',
          breadcrumbName: i18n.t('dop:Applications'),
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('project/pages/apps/app-list'), 'ProjectAppList'),
        },
        {
          path: 'apps/createApp',
          breadcrumbName: i18n.t('add application'),
          getComp: (cb) => cb(import('project/pages/apps/app-form')),
        },
        {
          path: 'issues',
          mark: 'issues',
          breadcrumbName: i18n.t('dop:project collaboration'),
          routes: [
            {
              path: 'plan',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/plan')),
              layout: {
                fullHeight: true,
              },
            },
            {
              path: 'all',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/all')),
              layout: {
                noWrapper: true,
                fullHeight: true,
              },
            },
            {
              path: 'requirement',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/requirement')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'task',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/task')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'bug',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/bug')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'backlog',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              layout: { noWrapper: true, fullHeight: true },
              getComp: (cb) => cb(import('project/pages/backlog')),
            },
            {
              path: 'iteration',
              tabs: PROJECT_TABS,
              ignoreTabQuery: true,
              routes: [
                {
                  tabs: PROJECT_TABS,
                  getComp: (cb) => cb(import('project/pages/iteration/table'), 'Iteration'),
                },
                {
                  path: ':iterationId/:issueType',
                  mark: 'iterationDetail',
                  ignoreTabQuery: true,
                  tabs: ITERATION_DETAIL_TABS,
                  getComp: (cb) => cb(import('project/pages/issue/')),
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
              getComp: (cb) => cb(import('project/pages/milestone'), 'Milestone'),
              layout: { noWrapper: true, fullHeight: true },
            },
          ],
        },
        {
          path: 'measure/dashboard',
          breadcrumbName: i18n.t('dop:efficiency measure'),
          getComp: (cb) => cb(import('project/pages/issue/issue-dashboard')),
          layout: {
            noWrapper: true,
          },
        },
        {
          path: 'ticket',
          breadcrumbName: i18n.t('dop:tickets'),
          getComp: (cb) => cb(import('project/pages/ticket')),
        },
        {
          path: 'pipelines',
          breadcrumbName: i18n.t('pipeline'),
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('project/pages/pipelines')),
        },
        {
          path: 'manual',
          pageName: i18n.t('dop:manual test'),
          routes: [
            {
              path: 'testCase',
              tabs: MANUAL_TEST_TABS,
              layout: { fullHeight: true },
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:manual test'),
              getComp: (cb) => cb(import('project/pages/test-manage/case/manual-test')),
            },
            {
              path: 'testPlan',
              tabs: MANUAL_TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:manual test'),
              routes: [
                {
                  getComp: (cb) => cb(import('project/pages/test-plan/test-plan')),
                },
                {
                  path: ':testPlanId',
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('dop:plan details'),
                  getComp: (cb) => cb(import('project/pages/plan-detail')),
                },
              ],
            },
            {
              path: 'testEnv',
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:manual test'),
              getComp: (cb) => cb(import('project/pages/test-env/test-env'), 'ManualTestEnv'),
              tabs: MANUAL_TEST_TABS,
            },
          ],
        },
        {
          path: 'auto',
          pageName: i18n.t('dop:auto test'),
          routes: [
            {
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/auto-test/index')),
            },
            {
              path: 'testCase',
              tabs: AUTO_TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:auto test'),
              routes: [
                {
                  getComp: (cb) => cb(import('project/pages/auto-test/index')),
                },
                {
                  path: ':spaceId/scenes',
                  mark: 'autoTestSpaceDetail',
                  breadcrumbName: `${i18n.t('dop:Scenes')}({testSpaceName})`,
                  routes: [
                    {
                      layout: { fullHeight: true },
                      getComp: (cb) => cb(import('project/pages/auto-test/scenes')),
                    },
                  ],
                },
              ],
            },
            {
              path: 'config-sheet',
              tabs: AUTO_TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:auto test'),
              layout: { fullHeight: true },
              getComp: (cb) => cb(import('project/pages/config-sheet')),
            },
            {
              path: 'testPlan',
              tabs: AUTO_TEST_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:auto test'),
              routes: [
                {
                  getComp: (cb) => cb(import('project/pages/test-plan/test-plan-protocol')),
                },
                {
                  path: ':testPlanId',
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('dop:plan details'),
                  getComp: (cb) => cb(import('project/pages/test-plan/auto-test-plan-detail')),
                },
              ],
            },
            {
              path: 'data-source',
              tabs: AUTO_TEST_TABS,
              layout: { fullHeight: true },
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:auto test'),
              getComp: (cb) => cb(import('project/pages/data-source')),
            },
            {
              path: 'testEnv',
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:auto test'),
              getComp: (cb) => cb(import('project/pages/test-env/test-env'), 'AutoTestEnv'),
              tabs: AUTO_TEST_TABS,
            },
          ],
        },
        {
          path: 'statistics',
          pageName: i18n.t('dop:statistics'),
          routes: [
            {
              path: 'code-coverage',
              tabs: TEST_STATISTICS_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:statistics'),
              getComp: (cb) => cb(import('project/pages/statistics/code-coverage')),
            },
            {
              path: 'test-dashboard',
              layout: {
                noWrapper: true,
              },
              tabs: TEST_STATISTICS_TABS,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:statistics'),
              getComp: (cb) => cb(import('project/pages/statistics/test-dashboard')),
            },
          ],
        },
        {
          path: 'test-report',
          breadcrumbName: i18n.t('dop:test report'),
          routes: [
            {
              getComp: (cb) => cb(import('project/pages/test-report')),
            },
            {
              path: 'create',
              breadcrumbName: i18n.t('dop:create test report'),
              layout: { noWrapper: true },
              getComp: (cb) => cb(import('project/pages/test-report/create')),
            },
          ],
        },
        {
          path: 'service',
          breadcrumbName: i18n.t('dop:addon'),
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('project/pages/addon/addon-category'), 'AddonCategory'),
        },
        {
          path: 'resource',
          breadcrumbName: i18n.t('resource summary'),
          getComp: (cb) => cb(import('project/pages/resource')),
        },
        {
          path: 'setting',
          breadcrumbName: `${i18n.t('project setting')}`,
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('project/pages/settings')),
        },
        getAppRouter(),
        {
          path: 'perm',
          pageName: i18n.t('role permissions description'),
          layout: { showSubSidebar: false, fullHeight: true },
          getComp: (cb) => cb(import('user/common/perm-editor/perm-editor'), 'PermEditor'),
        },
      ],
    },
  ];
}

export default getProjectRouter;

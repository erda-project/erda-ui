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

import React from 'react';
import { Redirect } from 'react-router-dom';
import { qs } from 'common/utils';
import getAppRouter from 'application/router';
import i18n from 'i18n';
import {
  COLLABORATE_TABS,
  AUTO_TEST_TABS,
  MANUAL_TEST_TABS,
  ITERATION_DETAIL_TABS,
  TEST_STATISTICS_TABS,
  DEPLOY_RUNTIME_TABS,
  DEPLOY_TABS,
  MEASURE_TABS,
  RELEASE_TABS,
  PIPELINE_TABS,
} from './tabs';

function getProjectRouter(): RouteConfigItem[] {
  return [
    {
      path: 'projects/:projectId',
      breadcrumbName: '{projectName}',
      mark: 'project',
      routes: [
        {
          breadcrumbName: i18n.t('dop:Project homepage'),
          layout: { fullHeight: true, noWrapper: true, className: 'project-homepage-wrapper' },
          getComp: (cb) => cb(import('project/pages/homepage'), 'ProjectHomepage'),
        },
        {
          path: 'apps',
          mark: 'projectAppList',
          routes: [
            {
              path: 'createApp',
              breadcrumbName: i18n.t('add application'),
              getComp: (cb) => cb(import('project/pages/apps/app-form')),
            },
            getAppRouter(),
            {
              breadcrumbName: i18n.t('App'),
              layout: { noWrapper: true },
              getComp: (cb) => cb(import('project/pages/apps/app-list'), 'ProjectAppList'),
            },
          ],
        },
        {
          path: 'issues',
          mark: 'issues',
          breadcrumbName: i18n.t('dop:project collaboration'),
          routes: [
            {
              path: 'gantt',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/gantt')),
              layout: {
                fullHeight: true,
                noWrapper: true,
              },
            },
            {
              path: 'all',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/all')),
              layout: {
                noWrapper: true,
                fullHeight: true,
              },
            },
            {
              path: 'board',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/board')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'task',
              render: (props) => {
                const { location } = props;
                const { search } = location;
                const params = qs.parse(search);
                return <Redirect to={`all?${qs.stringify({ ...params, type: 'TASK' })}`} />;
              },
            },
            {
              path: 'bug',
              render: (props) => {
                const { location } = props;
                const { search } = location;
                const params = qs.parse(search);
                return <Redirect to={`all?${qs.stringify({ ...params, type: 'BUG' })}`} />;
              },
            },
            {
              path: 'requirement',
              render: (props) => {
                const { location } = props;
                const { search } = location;
                const params = qs.parse(search);
                return <Redirect to={`all?${qs.stringify({ ...params, type: 'REQUIREMENT' })}`} />;
              },
            },
            {
              path: 'backlog',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              layout: { noWrapper: true, fullHeight: true },
              getComp: (cb) => cb(import('project/pages/backlog')),
            },
            {
              path: 'iteration',
              mark: 'projectIteration',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              routes: [
                {
                  tabs: COLLABORATE_TABS,
                  getComp: (cb) => cb(import('project/pages/iteration/table'), 'Iteration'),
                  layout: { noWrapper: true },
                },
                {
                  path: ':iterationId',
                  mark: 'iterationDetail',
                  breadcrumbName: i18n.t('dop:iteration'),
                  ignoreTabQuery: true,
                  // getComp: (cb) => cb(import('project/pages/issue/')),
                  routes: [
                    {
                      path: 'gantt',
                      tabs: ITERATION_DETAIL_TABS,
                      backToUp: 'projectIteration',
                      ignoreTabQuery: true,
                      getComp: (cb) => cb(import('project/pages/issue/gantt')),
                      layout: {
                        fullHeight: true,
                        noWrapper: true,
                      },
                    },
                    {
                      path: 'all',
                      tabs: ITERATION_DETAIL_TABS,
                      backToUp: 'projectIteration',
                      ignoreTabQuery: true,
                      getComp: (cb) => cb(import('project/pages/issue/all')),
                      layout: {
                        noWrapper: true,
                        fullHeight: true,
                      },
                    },
                    {
                      path: 'board',
                      tabs: ITERATION_DETAIL_TABS,
                      backToUp: 'projectIteration',
                      ignoreTabQuery: true,
                      getComp: (cb) => cb(import('project/pages/issue/board')),
                      layout: {
                        noWrapper: true,
                      },
                    },
                    {
                      path: 'statistics',
                      tabs: ITERATION_DETAIL_TABS,
                      backToUp: 'projectIteration',
                      ignoreTabQuery: true,
                      getComp: (cb) => cb(import('project/pages/issue/statistics')),
                      layout: {
                        noWrapper: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              path: 'milestone',
              tabs: COLLABORATE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/milestone'), 'Milestone'),
              layout: { noWrapper: true, fullHeight: true },
            },
          ],
        },
        {
          path: 'measure',
          breadcrumbName: i18n.t('dop:efficiency measure'),
          routes: [
            {
              path: 'bug',
              tabs: MEASURE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/issue/issue-dashboard')),
              layout: {
                noWrapper: true,
              },
            },
            {
              path: 'task',
              tabs: MEASURE_TABS,
              ignoreTabQuery: true,
              layout: { noWrapper: true, fullHeight: true },
              getComp: (cb) => cb(import('project/pages/issue/task-summary')),
            },
          ],
        },
        {
          path: 'ticket',
          breadcrumbName: i18n.t('Tickets'),
          getComp: (cb) => cb(import('project/pages/ticket')),
          layout: {
            noWrapper: true,
          },
        },
        {
          path: 'pipelines',
          breadcrumbName: i18n.t('pipeline'),
          routes: [
            {
              path: 'list',
              tabs: PIPELINE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/pipelines')),
              layout: { fullHeight: true, noWrapper: true },
            },
            {
              path: 'records',
              tabs: PIPELINE_TABS,
              ignoreTabQuery: true,
              getComp: (cb) => cb(import('project/pages/pipelines/components/records')),
              layout: { fullHeight: true, noWrapper: true },
            },
            {
              path: 'config/:workspace',
              layout: { noWrapper: true },
              alwaysShowTabKey: 'config',
              tabs: PIPELINE_TABS,
              getComp: (cb) => cb(import('project/pages/pipelines/pipeline-config')),
            },
          ],
        },
        {
          path: 'obsoleted-pipelines',
          breadcrumbName: i18n.t('pipeline'),
          getComp: (cb) => cb(import('project/pages/pipelines/old-pipeline')),
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
              mark: 'testPlan',
              routes: [
                {
                  getComp: (cb) => cb(import('project/pages/test-plan/test-plan')),
                  layout: {
                    noWrapper: true,
                  },
                },
                {
                  path: ':testPlanId',
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('dop:plan details'),
                  backToUp: 'testPlan',
                  getComp: (cb) => cb(import('project/pages/plan-detail')),
                },
              ],
            },
            {
              path: 'testEnv',
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('dop:manual test'),
              getComp: (cb) => cb(import('project/pages/test-env/test-env'), 'ManualTestEnv'),
              layout: {
                noWrapper: true,
              },
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
              mark: 'testCase',
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
                      backToUp: 'testCase',
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
              mark: 'testPlan',
              routes: [
                {
                  getComp: (cb) => cb(import('project/pages/test-plan/test-plan-protocol')),
                },
                {
                  path: ':testPlanId',
                  mark: 'testPlanDetail',
                  layout: { fullHeight: true },
                  breadcrumbName: i18n.t('dop:plan details'),
                  backToUp: 'testPlan',
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
          path: 'resource',
          breadcrumbName: i18n.t('Resource summary'),
          getComp: (cb) => cb(import('project/pages/resource')),
        },
        {
          path: 'setting',
          breadcrumbName: `${i18n.t('project setting')}`,
          layout: { fullHeight: true },
          getComp: (cb) => cb(import('project/pages/settings')),
        },
        {
          path: 'perm',
          pageName: i18n.t('role permissions description'),
          layout: { hideSidebar: true, fullHeight: true },
          getComp: (cb) => cb(import('user/common/perm-editor/perm-editor'), 'PermEditor'),
        },
        {
          path: 'release',
          routes: [
            {
              path: 'project',
              breadcrumbName: i18n.t('Artifact'),
              tabs: RELEASE_TABS,
              ignoreTabQuery: true,
              mark: 'projectRelease',
              routes: [
                {
                  layout: { noWrapper: true },
                  getComp: (cb) => cb(import('project/pages/release/project')),
                },
                {
                  path: ':releaseID',
                  pageName: `${i18n.t('Artifact')}${i18n.t('detail')}`,
                  backToUp: 'projectRelease',
                  getComp: (cb) => cb(import('project/pages/release/components/project-detail')),
                },
                {
                  path: 'createRelease/:type',
                  pageName: i18n.t('create {name}', { name: i18n.t('Artifact') }),
                  backToUp: 'projectRelease',
                  getComp: (cb) => cb(import('project/pages/release/components/form')),
                  layout: { fullHeight: true },
                },
                {
                  path: 'updateRelease/:releaseID',
                  pageName: i18n.t('edit {name}', { name: i18n.t('Artifact') }),
                  backToUp: 'projectRelease',
                  getComp: (cb) => cb(import('project/pages/release/components/update')),
                  layout: { fullHeight: true },
                },
              ],
            },
            {
              path: 'application',
              breadcrumbName: i18n.t('Artifact'),
              tabs: RELEASE_TABS,
              mark: 'applicationRelease',
              ignoreTabQuery: true,
              routes: [
                {
                  layout: { noWrapper: true },
                  getComp: (cb) => cb(import('project/pages/release/application')),
                },
                {
                  path: ':releaseID',
                  pageName: `${i18n.t('Artifact')}${i18n.t('detail')}`,
                  backToUp: 'applicationRelease',
                  getComp: (cb) => cb(import('project/pages/release/components/application-detail')),
                  layout: { fullHeight: true },
                },
                {
                  path: 'updateRelease/:releaseID',
                  pageName: i18n.t('edit {name}', { name: i18n.t('Artifact') }),
                  backToUp: 'applicationRelease',
                  getComp: (cb) => cb(import('project/pages/release/components/update')),
                  layout: { fullHeight: true },
                },
              ],
            },
          ],
        },
        {
          path: 'deploy',
          pageName: i18n.t('dop:Environments'),
          routes: [
            {
              path: 'list/:workspace',
              tabs: DEPLOY_TABS,
              mark: 'projectDeployEnv',
              ignoreTabQuery: true,
              alwaysShowTabKey: 'list',
              routes: [
                {
                  layout: { noWrapper: true },
                  getComp: (cb) => cb(import('project/pages/deploy')),
                },
                {
                  path: ':appId/runtime/:runtimeId',
                  tabs: DEPLOY_RUNTIME_TABS,
                  backToUp: 'projectDeployEnv',
                  mark: 'projectDeployRuntime',
                  getComp: (cb) => cb(import('app/modules/runtime/pages/overview')),
                  layout: {
                    noWrapper: true,
                  },
                },
              ],
            },
            {
              path: 'config/:workspace',
              layout: { noWrapper: true },
              alwaysShowTabKey: 'config',
              tabs: DEPLOY_TABS,
              getComp: (cb) => cb(import('project/pages/deploy/deploy-config')),
            },
            {
              path: 'addon',
              tabs: DEPLOY_TABS,
              layout: { fullHeight: true },
              getComp: (cb) => cb(import('project/pages/addon/addon-category'), 'AddonCategory'),
            },
          ],
        },
      ],
    },
  ];
}

export default getProjectRouter;

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
import { ENV_MAP } from 'app/locales/utils';
import { APP_TABS, DEPLOY_RUNTIME_TABS } from './tabs';

function getAppRouter(): RouteConfigItem {
  return {
    path: ':appId',
    mark: 'application',
    breadcrumbName: i18n.t('App'),
    tabs: APP_TABS,
    backToUp: 'projectAppList',
    routes: [
      {
        path: 'repo',
        mark: 'repo',
        tabs: APP_TABS,
        backToUp: 'projectAppList',
        alwaysShowTabKey: 'repo',
        routes: [
          {
            tabs: APP_TABS,
            backToUp: 'projectAppList',
            alwaysShowTabKey: 'repo',
            ignoreTabQuery: true,
            getComp: (cb) => cb(import('application/pages/repo/repo-tree')),
          },
          {
            path: 'tree/(.*)',
            mark: 'repoTree',
            tabs: APP_TABS,
            backToUp: 'projectAppList',
            alwaysShowTabKey: 'repo',
            ignoreTabQuery: true,
            getComp: (cb) => cb(import('application/pages/repo/repo-tree')),
          },
          {
            path: 'branches',
            tabs: APP_TABS,
            alwaysShowTabKey: 'repo/branches',
            mark: 'repoBranches',
            ignoreTabQuery: true,
            routes: [
              {
                path: 'compare/:branches*',
                mark: 'repoCompare',
                backToUp: 'repoBranches',
                breadcrumbName: i18n.t('dop:branches'),
                ignoreTabQuery: true,
                getComp: (cb) => cb(import('application/pages/repo/branch-compare-detail'), 'BranchCompareDetail'),
                layout: { noWrapper: true },
              },
              {
                ignoreTabQuery: true,
                backToUp: 'projectAppList',
                getComp: (cb) => cb(import('application/pages/repo/repo-branch')),
                layout: { noWrapper: true },
              },
            ],
          },
          {
            path: 'commit',
            tabs: APP_TABS,
            backToUp: 'projectAppList',
            alwaysShowTabKey: 'repo/commits',
            ignoreTabQuery: true,
            routes: [
              {
                path: ':commitId',
                backToUp: 'repo',
                breadcrumbName: i18n.t('dop:Code'),
                ignoreTabQuery: true,
                getComp: (cb) => cb(import('application/pages/repo/commit-detail')),
              },
            ],
          },
          {
            path: 'commits/(.*)', // commits后面可能有分支(包含/)，commit后面只有commitId
            tabs: APP_TABS,
            backToUp: 'projectAppList',
            alwaysShowTabKey: 'repo/commits',
            ignoreTabQuery: true,
            getComp: (cb) => cb(import('application/pages/repo/repo-commit')),
          },
          {
            path: 'mr/:mrType',
            tabs: APP_TABS,
            mark: 'repoMr',
            alwaysShowTabKey: 'repo/mr/open',
            ignoreTabQuery: true,
            routes: [
              {
                path: 'createMR',
                breadcrumbName: i18n.t('dop:merge request'),
                ignoreTabQuery: true,
                backToUp: 'repoMr',
                layout: { fullHeight: true },
                getComp: (cb) => cb(import('application/pages/repo/repo-mr-creation'), 'RepoMRCreation'),
              },
              {
                path: ':mergeId',
                breadcrumbName: i18n.t('dop:merge request'),
                backToUp: 'repoMr',
                ignoreTabQuery: true,
                layout: { fullHeight: true },
                getComp: (cb) => cb(import('application/pages/repo/mr-detail')),
              },
              {
                ignoreTabQuery: true,
                backToUp: 'projectAppList',
                getComp: (cb) => cb(import('application/pages/repo/repo-mr')),
                layout: { noWrapper: true },
              },
            ],
          },
          // entry is closed
          // {
          //   path: 'backup',
          //   breadcrumbName: i18n.t('dop:repo backup'),
          //   tabs: APP_TABS,
          //   layout: { noWrapper: true },
          //   getComp: (cb) => cb(import('app/modules/application/pages/repo/repo-backup')),
          // },
        ],
      },
      {
        path: 'pipeline',
        mark: 'pipeline',
        backToUp: 'projectAppList',
        tabs: APP_TABS,
        ignoreTabQuery: true,
        getComp: (cb) => cb(import('application/pages/pipeline')),
        layout: { fullHeight: true, noWrapper: true },
      },
      {
        path: 'dataTask',
        mark: 'dataTask',
        backToUp: 'projectAppList',
        tabs: APP_TABS,
        routes: [
          {
            path: ':pipelineID',
            getComp: (cb) => cb(import('application/pages/build/dataTask'), 'DataTask'),
          },
          {
            getComp: (cb) => cb(import('application/pages/build/dataTask'), 'DataTask'),
          },
        ],
      },
      {
        path: 'dataModel',
        backToUp: 'projectAppList',
        tabs: APP_TABS,
        routes: [
          {
            path: 'starChart/:filePath',
            getComp: (cb) => cb(import('application/pages/data-model/model-star-chart'), 'ModelStarChart'),
          },
          {
            getComp: (cb) => cb(import('application/pages/data-model/data-model'), 'DataModel'),
          },
        ],
      },
      {
        path: 'dataMarket',
        backToUp: 'projectAppList',
        tabs: APP_TABS,
        getComp: (cb) => cb(import('application/pages/data-market/data-market'), 'DataMarket'),
      },
      {
        path: 'quality',
        backToUp: 'projectAppList',
        tabs: APP_TABS,
        ignoreTabQuery: true,
        getComp: (cb) => cb(import('application/pages/quality/entry')),
        layout: { noWrapper: true },
      },
      {
        path: 'deploy',
        routes: [
          {
            path: 'list/:workspace',
            mark: 'appDeployEnv',
            tabs: APP_TABS,
            ignoreTabQuery: true,
            alwaysShowTabKey: 'deploy',
            routes: [
              {
                backToUp: 'projectAppList',
                layout: { noWrapper: true },
                getComp: (cb) => cb(import('project/pages/deploy')),
              },
              {
                path: 'runtime/:runtimeId',
                tabs: DEPLOY_RUNTIME_TABS,
                backToUp: 'appDeployEnv',
                mark: 'appDeployRuntime',
                breadcrumbName: ({ params }) => {
                  const { workspace } = params;
                  return ENV_MAP[workspace];
                },
                getComp: (cb) => cb(import('app/modules/runtime/pages/overview')),
                layout: {
                  noWrapper: true,
                },
              },
            ],
          },
        ],
      },
      {
        path: 'apiDesign',
        mark: 'apiDesign',
        tabs: APP_TABS,
        backToUp: 'projectAppList',
        ignoreTabQuery: true,
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('apiManagePlatform/pages/api-market/design')),
      },
      {
        path: 'setting',
        tabs: APP_TABS,
        backToUp: 'projectAppList',
        ignoreTabQuery: true,
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('application/pages/settings/app-settings')),
      },
    ],
  };
}

export default getAppRouter;

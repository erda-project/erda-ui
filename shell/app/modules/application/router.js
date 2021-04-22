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

import getRuntimeRouter from 'runtime/router';
import i18n from 'i18n';
import { ticketTabs } from './pages/ticket';
import { mrTabs } from './pages/repo/repo-mr';
import { BRANCH_TABS } from './pages/repo/repo-branch';

function getAppRouter() {
  return {
    path: 'apps/:appId',
    mark: 'application',
    breadcrumbName: '{appName}',
    routes: [
      {
        path: 'deploy',
        mark: 'deploy',
        breadcrumbName: i18n.t('application:deploy center'),
        routes: [
          ...getRuntimeRouter(),
          {
            layout: { noWrapper: true },
            getComp: cb => cb(import('application/pages/deploy/deploy'), 'DeployWrap'),
          },
        ],
      },
      {
        path: 'ticket/:ticketType',
        breadcrumbName: i18n.t('application:issues'),
        tabs: ticketTabs,
        routes: [
          {
            layout: { fullHeight: true },
            getComp: cb => cb(import('application/pages/ticket')),
          },
          {
            path: ':ticketId',
            breadcrumbName: i18n.t('application:issue detail'),
            getComp: cb => cb(import('application/pages/ticket/ticket-detail')),
          },
        ],
      },
      {
        path: 'repo',
        mark: 'repo',
        pageName: i18n.t('application:repository'),
        routes: [
          {
            getComp: cb => cb(import('application/pages/repo/repo-tree')),
          },
          {
            path: 'tree/*',
            mark: 'repoTree',
            breadcrumbName: i18n.t('application:code'),
            getComp: cb => cb(import('application/pages/repo/repo-tree')),
          },
          {
            path: 'branches',
            tabs: BRANCH_TABS,
            breadcrumbName: i18n.t('application:branch management'),
            routes: [
              {
                path: 'compare/:branches*',
                mark: 'repoCompare',
                breadcrumbName: i18n.t('application:branch comparison'),
                getComp: cb => cb(import('application/pages/repo/branch-compare-detail'), 'BranchCompareDetail'),
              },
              {
                tabs: BRANCH_TABS,
                getComp: cb => cb(import('application/pages/repo/repo-branch')),
              },
            ],
          },
          {
            path: 'tags',
            tabs: BRANCH_TABS,
            breadcrumbName: i18n.t('application:branch management'),
            routes: [
              {
                tabs: BRANCH_TABS,
                getComp: cb => cb(import('application/pages/repo/repo-tag')),
              },
            ],
          },
          {
            path: 'commit',
            routes: [
              {
                path: ':commitId',
                breadcrumbName: i18n.t('application:commit details'),
                getComp: cb => cb(import('application/pages/repo/commit-detail')),
              },
            ],
          },
          {
            path: 'commits/*', // commits后面可能有分支(包含/)，commit后面只有commitId
            breadcrumbName: i18n.t('application:commit history'),
            getComp: cb => cb(import('application/pages/repo/repo-commit')),
          },
          {
            path: 'mr/:mrType',
            breadcrumbName: i18n.t('application:merge requests'),
            tabs: mrTabs,
            routes: [
              {
                path: 'createMR',
                breadcrumbName: i18n.t('application:new merge request'),
                getComp: cb => cb(import('application/pages/repo/repo-mr-creation'), 'RepoMRCreation'),
              },
              {
                path: ':mergeId',
                breadcrumbName: i18n.t('application:merge request detail'),
                getComp: cb => cb(import('application/pages/repo/mr-detail')),
              },
              {
                tabs: mrTabs,
                getComp: cb => cb(import('application/pages/repo/repo-mr')),
              },
            ],
          },
          {
            path: 'release',
            breadcrumbName: i18n.t('releases'),
            layout: { fullHeight: true, noWrapper: true },
            getComp: cb => cb(import('app/modules/application/pages/release/release-list')),
          },
          {
            path: 'backup',
            breadcrumbName: i18n.t('application:repo backup'),
            getComp: cb => cb(import('app/modules/application/pages/repo/repo-backup')),
          },
        ],
      },
      {
        path: 'apiDesign',
        mark: 'apiDesign',
        breadcrumbName: i18n.t('project:API design'),
        routes: [
          {
            layout: { fullHeight: true },
            getComp: cb => cb(import('apiManagePlatform/pages/api-market/design')),
          },
        ],
      },
      {
        path: 'pipeline',
        mark: 'pipeline',
        pageName: i18n.t('application:pipeline'),
        getComp: cb => cb(import('application/pages/pipeline')),
        layout: { fullHeight: true },
      },
      // {
      //   path: 'pipeline1',
      //   mark: 'pipeline',
      //   pageName: i18n.t('application:pipeline'),
      //   commonComp: cb => cb(import('application/pages/build/pipeline'), 'Pipeline'),
      //   commonKey: 'pipeline',
      //   routes: [
      //     {
      //       path: ':pipelineID',
      //       layout: { fullHeight: true },
      //       breadcrumbName: i18n.t('application:pipeline'),
      //       useCommonComp: true,
      //     },
      //     {
      //       layout: { fullHeight: true },
      //       useCommonComp: true,
      //     },
      //   ],
      // },
      {
        path: 'dataTask',
        mark: 'dataTask',
        pageName: `${i18n.t('application:data task')}`,
        routes: [
          {
            path: ':pipelineID',
            breadcrumbName: `${i18n.t('application:data task')}`,
            getComp: cb => cb(import('application/pages/build/dataTask'), 'DataTask'),
          },
          {
            getComp: cb => cb(import('application/pages/build/dataTask'), 'DataTask'),
          },
        ],
      },
      {
        path: 'dataModel',
        breadcrumbName: i18n.t('application:data model'),
        routes: [
          {
            path: 'starChart/:filePath',
            breadcrumbName: i18n.t('application:data model detail'),
            getComp: cb => cb(import('application/pages/data-model/model-star-chart'), 'ModelStarChart'),
          },
          {
            getComp: cb => cb(import('application/pages/data-model/data-model'), 'DataModel'),
          },
        ],
      },
      {
        path: 'dataMarket',
        breadcrumbName: i18n.t('application:data market'),
        getComp: cb => cb(import('application/pages/data-market/data-market'), 'DataMarket'),
      },
      {
        path: 'test',
        routes: [
          {
            listKey: 'apps',
            breadcrumbName: i18n.t('application:test runs'),
            getComp: cb => cb(import('application/pages/test/test-list')),
          },
          {
            path: 'quality',
            breadcrumbName: i18n.t('application:quality reports'),
            getComp: cb => cb(import('application/pages/quality'), 'CodeQualityWrap'),
          },
          {
            path: ':testId',
            breadcrumbName: i18n.t('application:test detail'),
            getComp: cb => cb(import('application/pages/test/test-detail-container')),
          },
        ],
      },
      {
        path: 'setting',
        breadcrumbName: i18n.t('application:application setting'),
        layout: { fullHeight: true },
        getComp: cb => cb(import('application/pages/settings/app-settings')),
      },
    ],
  };
}

export default getAppRouter;

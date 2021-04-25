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

const approvalTabs = [
  {
    key: 'undone',
    name: i18n.t('org:to be approved'),
  },
  {
    key: 'done',
    name: i18n.t('org:approved'),
  },
];

function getOrgCenterRouter() {
  return [
    {
      path: 'orgCenter',
      mark: 'orgCenter',
      routes: [
        {
          path: 'projects',
          breadcrumbName: i18n.t('projects'),
          routes: [
            {
              path: 'createProject',
              breadcrumbName: i18n.t('add project'),
              getComp: cb => cb(import('app/modules/org/pages/projects/create-project')),
            },
            {
              getComp: cb => cb(import('app/modules/org/pages/projects/project-list'), 'ProjectList'),
            },
            {
              path: ':projectId',
              mark: 'orgProject',
              routes: [
                // {
                //   breadcrumbName: '{projectName}',
                //   getComp: cb => cb(import('org/pages/projects/dashboard')),
                // },
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
                  path: 'setting',
                  breadcrumbName: '{projectName}',
                  getComp: cb => cb(import('app/modules/org/pages/projects/settings')),
                },
              ],
            },
          ],
        },
        {
          path: 'market',
          mark: 'orgMarket',
          routes: [
            {
              path: 'publisher/setting',
              breadcrumbName: i18n.t('org:publisher info'),
              routes: [
                {
                  getComp: cb => cb(import('app/modules/publisher/pages/publisher-manage/publisher-setting')),
                },
              ],
            },
          ],
        },
        {
          path: 'certificate',
          breadcrumbName: i18n.t('org:certificate'),
          getComp: cb => cb(import('app/modules/org/pages/certificate')),
        },
        {
          path: 'safety',
          breadcrumbName: i18n.t('org:audit log'),
          getComp: cb => cb(import('app/modules/org/pages/safety')),
        },
        {
          path: 'approval/:approvalType',
          breadcrumbName: i18n.t('org:approval'),
          tabs: approvalTabs,
          ignoreTabQuery: true,
          getComp: cb => cb(import('app/modules/org/pages/approval')),
        },
        {
          path: 'announcement',
          pageName: i18n.t('org:announcement'),
          breadcrumbName: i18n.t('org:announcement'),
          getComp: cb => cb(import('org/pages/announcement')),
        },
        {
          path: 'setting',
          mark: 'orgSetting',
          routes: [
            {
              path: 'detail',
              layout: { fullHeight: true },
              breadcrumbName: i18n.t('org:org detail'),
              getComp: cb => cb(import('app/modules/org/pages/setting/org-setting'), 'OrgSetting'),
            },
          ],
        },
      ],
    },
  ]
}

export default getOrgCenterRouter;

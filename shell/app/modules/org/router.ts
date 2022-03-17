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
import permStore from 'user/stores/permission';
import { MEASURE_TABS } from 'app/modules/project/tabs';

const projectSettingTabs = () => [
  {
    key: 'info',
    breadcrumbName: '{projectName}',
    name: i18n.t('dop:project info'),
  },
  {
    key: 'member',
    breadcrumbName: '{projectName}',
    name: i18n.t('dop:project member'),
  },
];

const marketTabs = () => {
  const orgPerm = permStore.useStore((s) => s.org);
  return [
    {
      key: 'setting',
      name: i18n.t('cmp:publisher info'),
      show: orgPerm.orgCenter.viewMarket.pass,
    },
    {
      key: 'certificate',
      name: i18n.t('layout:certificate'),
      show: orgPerm.orgCenter.viewCertificate.pass,
    },
  ];
};

function getOrgCenterRouter(): RouteConfigItem[] {
  return [
    {
      path: 'orgCenter',
      mark: 'orgCenter',
      toMark: 'orgIndex',
      routes: [
        {
          path: 'projects',
          breadcrumbName: i18n.t('projects'),
          routes: [
            {
              path: 'createProject',
              breadcrumbName: i18n.t('add project'),
              getComp: (cb) => cb(import('app/modules/org/pages/projects/add-project')),
            },
            {
              path: 'importProject',
              breadcrumbName: i18n.t('import project'),
              getComp: (cb) => cb(import('app/modules/org/pages/projects/import-project')),
            },
            {
              layout: { noWrapper: true },
              getComp: (cb) => cb(import('app/modules/org/pages/projects/project-list'), 'ProjectList'),
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
                  path: 'info',
                  tabs: projectSettingTabs,
                  layout: { noWrapper: true },
                  breadcrumbName: '{projectName}',
                  getComp: (cb) => cb(import('app/modules/org/pages/projects/settings/info')),
                },
                {
                  path: 'member',
                  tabs: projectSettingTabs,
                  layout: { noWrapper: true },
                  breadcrumbName: '{projectName}',
                  getComp: (cb) => cb(import('app/modules/org/pages/projects/settings/member')),
                },
              ],
            },
          ],
        },
        {
          path: 'market/publisher',
          mark: 'orgMarket',
          pageName: i18n.t('layout:mobile development management'),
          routes: [
            {
              path: 'setting',
              tabs: marketTabs,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('layout:mobile development management'),
              routes: [
                {
                  getComp: (cb) => cb(import('app/modules/publisher/pages/publisher-manage/publisher-setting')),
                },
              ],
            },
            {
              path: 'certificate',
              tabs: marketTabs,
              ignoreTabQuery: true,
              breadcrumbName: i18n.t('layout:mobile development management'),
              getComp: (cb) => cb(import('app/modules/org/pages/certificate')),
            },
          ],
        },
        {
          path: 'safety',
          breadcrumbName: i18n.t('cmp:audit log'),
          getComp: (cb) => cb(import('app/modules/org/pages/safety')),
        },
        {
          path: 'approval',
          breadcrumbName: i18n.t('cmp:approval'),
          ignoreTabQuery: true,
          getComp: (cb) => cb(import('app/modules/org/pages/approval')),
          layout: { noWrapper: true },
        },
        {
          path: 'setting',
          mark: 'orgSetting',
          routes: [
            {
              path: 'detail',
              layout: { fullHeight: true },
              breadcrumbName: i18n.t('org setting'),
              getComp: (cb) => cb(import('app/modules/org/pages/setting/org-setting'), 'OrgSetting'),
            },
          ],
        },
      ],
    },
  ];
}

export default getOrgCenterRouter;

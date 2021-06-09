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

const reportTabs = [
  {
    key: 'weekly',
    name: i18n.t('microService:weekly report'),
  },
  {
    key: 'daily',
    name: i18n.t('microService:daily report'),
  },
];

function projectReportRouter() {
  return {
    path: 'reports',
    alwaysShowTabKey: 'weekly',
    tabs: reportTabs,
    routes: [
      {
        path: 'weekly',
        tabs: reportTabs,
        alwaysShowTabKey: 'weekly',
        getComp: (cb) => cb(import('microService/monitor/project-report/pages/weekly')),
      },
      {
        path: 'daily',
        tabs: reportTabs,
        alwaysShowTabKey: 'daily',
        getComp: (cb) => cb(import('microService/monitor/project-report/pages/daily')),
      },
      {
        pageName: i18n.t('microService:project report'),
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('microService/monitor/project-report/pages/weekly')),
      },
    ],
  };
}

export default projectReportRouter;

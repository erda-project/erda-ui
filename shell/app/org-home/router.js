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

import getWorkBenchRouter from 'workBench/router';
import getMicroServiceRouter from 'microService/router'
import getEdgeRouter from 'app/modules/edge/router';
import getDataCenterRouter from 'dataCenter/router';
import getOrgCenterRouter from 'org/router';
import getLayoutRouter from 'layout/router'

export default function getOrgRouter() {
  return [
    {
      path: ':orgName',
      mark: 'orgIndex',
      routes: [
        {
          getComp: cb => cb(import('app/org-home/pages/personal-home')),
          layout: {
            hideHeader: true,
            showSubSidebar: false,
            fullHeight: true,
            noWrapper: true,
          },
        },
        {
          path: 'org-list',
          getComp: cb => cb(import('app/org-home/pages/org-list'), 'OrgList'),
          layout: {
            hideHeader: true,
            showSubSidebar: false,
            fullHeight: true,
            noWrapper: true,
          },
        },
        ...getLayoutRouter(),
        ...getWorkBenchRouter(),
        ...getMicroServiceRouter(),
        ...getEdgeRouter(),
        ...getDataCenterRouter(),
        ...getOrgCenterRouter(),
      ]
    },
  ];
}

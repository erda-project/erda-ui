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
import { getMspBreadcrumb } from 'msp/config';

const traceTabs = [
  {
    key: 'search',
    name: i18n.t('msp:tracing query'),
  },
  {
    key: 'debug',
    name: i18n.t('msp:tracing debug'),
  },
];

function monitorTraceRouter(): RouteConfigItem {
  return {
    path: 'trace',
    alwaysShowTabKey: 'search',
    tabs: traceTabs,
    breadcrumbName: getMspBreadcrumb('Tracing'),
    routes: [
      {
        path: 'debug',
        tabs: traceTabs,
        routes: [
          {
            layout: { noWrapper: true },
            getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-querier')),
          },
          {
            path: 'trace-detail/:traceId',
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) =>
              cb(import('msp/monitor/trace-insight/pages/trace-querier/trace-search-detail')),
          },
        ],
      },
      {
        path: 'trace-detail/:traceId',
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('msp/monitor/trace-insight/pages/trace-querier/trace-search-detail')),
      },
      {
        path: 'search',
        tabs: traceTabs,
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-search')),
      },
      {
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-search')),
      },
    ],
  };
}

export default monitorTraceRouter;

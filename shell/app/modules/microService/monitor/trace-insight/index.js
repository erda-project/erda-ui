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

const traceTabs = [
  {
    key: 'search',
    name: i18n.t('microService:transactions'),
  },
  {
    key: 'debug',
    name: i18n.t('microService:tracing debug'),
  },
];

function monitorTraceRouter() {
  return {
    path: 'trace',
    alwaysShowTabKey: 'search',
    tabs: traceTabs,
    breadcrumbName: i18n.t('microService:transactions'),
    routes: [
      {
        path: 'debug',
        tabs: traceTabs,
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-querier')),
      },
      {
        path: 'search',
        tabs: traceTabs,
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-search')),
      },
      {
        breadcrumbName: i18n.t('microService:tracing details'),
        path: ':traceId',
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-detail')),
      },
      {
        layout: { noWrapper: true },
        getComp: (cb) => cb(import('trace-insight/pages/trace-querier/trace-search')),
      },
    ],
  };
}

export default monitorTraceRouter;

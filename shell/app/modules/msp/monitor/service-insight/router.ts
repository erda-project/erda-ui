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

import { SITabs } from './pages/index';

const getSIRouter = (): RouteConfigItem => ({
  path: 'si',
  mark: 'serviceInsight',
  breadcrumbName: ({ infoMap }) => {
    const { SIBaseInfo = {} } = infoMap;
    const { applicationName, runtimeName, serviceName } = SIBaseInfo || {};
    return `${applicationName} / ${runtimeName} / ${serviceName}`;
  },
  routes: [
    {
      path: 'overview',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/overview/overview')),
    },
    {
      path: 'rpc',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/rpc/rpc')),
    },
    {
      path: 'web',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/web/web')),
    },
    {
      path: 'db',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/database/database')),
    },
    {
      path: 'cache',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/cache/cache')),
    },
    {
      path: 'jvm',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/jvms/jvms')),
    },
    {
      path: 'nodejs',
      tabs: SITabs,
      getComp: (cb) => cb(import('msp/monitor/service-insight/pages/nodes/nodes')),
    },
  ],
});

export default getSIRouter;

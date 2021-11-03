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

import getEIRouter from 'msp/monitor/external-insight';
import getGatewayIngressMonitorRouter from 'msp/monitor/gateway-ingress';
import i18n from 'i18n';

function monitorTopologyRouter() {
  return {
    path: 'topology/:terminusKey',
    pageName: i18n.t('msp:monitoring overview'),
    breadcrumbName: i18n.t('msp:monitoring overview'),
    routes: [
      {
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('topology/pages/topology/topology')),
      },
      getGatewayIngressMonitorRouter(),
      getEIRouter(),
      {
        path: ':applicationId/:runtimeName/:serviceName',
        routes: [
          {
            path: 'si/:type',
            getComp: (cb) => cb(import('topology/pages/transfer/si')),
          },
        ],
      },
    ],
  };
}

export default monitorTopologyRouter;

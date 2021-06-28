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

import getBIRouter from 'msp/monitor/browser-insight';
import getAIRouter from 'msp/monitor/application-insight';
import getMIRouter from 'msp/monitor/mobile-insight';
import getApiInsightRouter from 'msp/monitor/api-insight';
import monitorTraceRouter from 'msp/monitor/trace-insight';
import monitorErrorRouter from 'msp/monitor/error-insight';
import monitorStatusRouter from 'msp/monitor/status-insight';
import alarmRouter from 'msp/monitor/monitor-alarm';
import projectReportRouter from 'msp/monitor/project-report';
import customDashboardRouter from 'msp/monitor/custom-dashboard';
import alarmRecordRouter from 'msp/monitor/alarm-record';
import serviceListRouter from 'msp/monitor/service-list';
import i18n from 'i18n';

const monitorChildRouters = [
  {
    path: 'overview',
    breadcrumbName: i18n.t('msp:monitoring overview'),
    getComp: (cb) => cb(import('msp/monitor/monitor-overview/pages/overview/overview')),
  },
  getAIRouter(),
  getBIRouter(),
  getMIRouter(),
  getApiInsightRouter(),
  monitorTraceRouter(),
  monitorStatusRouter(),
  monitorErrorRouter(),
  alarmRouter(),
  serviceListRouter(),
  {
    path: 'custom-alarm',
    breadcrumbName: i18n.t('custom alarm'),
    routes: [
      {
        path: ':dashboardId',
        breadcrumbName: '{dashboardName}',
        layout: { fullHeight: true },
        getComp: (cb) => cb(import('msp/monitor/custom-dashboard/pages/custom-dashboard')),
      },
      {
        getComp: (cb) => cb(import('monitor-alarm/pages/custom-alarm')),
      },
    ],
  },
  alarmRecordRouter(),
  customDashboardRouter(),
  projectReportRouter(),
];

function getMonitorRouter() {
  return {
    path: ':terminusKey',
    mark: 'monitor',
    routes: monitorChildRouters,
  };
}

export default getMonitorRouter;

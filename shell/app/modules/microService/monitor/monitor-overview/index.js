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

import getBIRouter from 'microService/monitor/browser-insight';
import getAIRouter from 'microService/monitor/application-insight';
import getMIRouter from 'microService/monitor/mobile-insight';
import getApiInsightRouter from 'microService/monitor/api-insight';
import monitorTraceRouter from 'microService/monitor/trace-insight';
import monitorErrorRouter from 'microService/monitor/error-insight';
import monitorStatusRouter from 'microService/monitor/status-insight';
import alarmRouter from 'microService/monitor/monitor-alarm';
import projectReportRouter from 'microService/monitor/project-report';
import customDashboardRouter from 'microService/monitor/custom-dashboard';
import alarmRecordRouter from 'microService/monitor/alarm-record';
import serviceListRouter from 'microService/monitor/service-list';
import i18n from 'i18n';

const monitorChildRouters = [
  {
    path: 'overview',
    breadcrumbName: i18n.t('microService:monitoring overview'),
    getComp: (cb) => cb(import('microService/monitor/monitor-overview/pages/overview/overview')),
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
        getComp: (cb) => cb(import('microService/monitor/custom-dashboard/pages/custom-dashboard')),
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

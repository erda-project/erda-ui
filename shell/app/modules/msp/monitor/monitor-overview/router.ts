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

import getBIRouter from 'msp/monitor/browser-insight/router';
import getApiInsightRouter from 'msp/monitor/api-insight/router';
import monitorTraceRouter from 'msp/monitor/trace-insight/router';
import monitorErrorRouter from 'msp/monitor/error-insight/router';
import monitorStatusRouter from 'msp/monitor/status-insight/router';
import { serviceAnalysisRouter } from 'msp/env-overview/service-list/router';

function getMonitorRouter(): RouteConfigItem {
  return {
    path: ':terminusKey',
    mark: 'monitor',
    routes: [
      getBIRouter(),
      getApiInsightRouter(),
      monitorTraceRouter(),
      monitorStatusRouter(),
      serviceAnalysisRouter(),
      monitorErrorRouter(),
    ],
  };
}

export default getMonitorRouter;

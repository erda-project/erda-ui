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

import { merge } from 'lodash';
import { chartRender } from 'service-insight/common/components/siRenderFactory';
import { ApiMap } from './apiConfig';
import i18n from 'i18n';

export const commonAttr = {
  moduleName: 'SIOverview',
  groupId: 'SIOverview',
};
const chartMap = merge(
  {
    throughput: {
      titleText: i18n.t('msp:interface throughput'),
      ...commonAttr,
      chartName: 'throughput',
    },
    responseTime: {
      titleText: i18n.t('response time'),
      ...commonAttr,
      chartName: 'overviewWeb',
    },
    httpState: {
      titleText: i18n.t('msp:http status'),
      ...commonAttr,
      chartName: 'overviewCpm',
    },
  },
  ApiMap,
);

export default {
  throughput: chartRender(chartMap.throughput) as any,
  responseTime: chartRender(chartMap.responseTime) as any,
  httpState: chartRender(chartMap.httpState) as any,
};

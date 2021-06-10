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
import { chartRender } from 'browser-insight/common/components/biRenderFactory';
import { ApiMap } from './apiConfig';
import i18n from 'i18n';

const chartMap = merge(
  {
    apdex: {
      moduleName: 'BIPosition',
      chartName: 'apdex',
      viewProps: {
        seriesType: 'bar',
        isBarChangeColor: true,
        isLabel: true,
        yAxisNames: [i18n.t('microService:requests count')],
        opt: {
          grid: { top: 30, bottom: 10, left: 25 },
        },
      },
    },
    timing: {
      moduleName: 'BIPosition',
      chartName: 'timing',
      viewProps: {
        seriesType: 'bar',
        isBarChangeColor: true,
        isLabel: true,
        yAxisNames: [i18n.t('microService:requests count')],
        opt: {
          grid: { top: 30, bottom: 0, right: 35, left: 25 },
          xAxies: [{ name: `${i18n.t('microService:time')}(ms)`, nameGap: -20 }],
        },
      },
    },
    dimension: {
      moduleName: 'BIPosition',
      viewType: 'pie',
    },
  },
  ApiMap,
);

export default {
  apdex: chartRender(chartMap.apdex) as any,
  timing: chartRender(chartMap.timing) as any,
  dimension: chartRender(chartMap.dimension) as any,
};

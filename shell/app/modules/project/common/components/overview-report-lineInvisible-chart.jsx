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

import * as React from 'react';
import { size } from 'lodash';
import { ChartRender } from 'charts';

export default class OverviewReportLineInvisibleChart extends React.Component {
  getOption = () => {
    const { data } = this.props;
    const option = {
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        containLabel: false,
      },
      xAxis: [
        {
          type: 'category',
          show: false,
          data: data.time || [],
          boundaryGap: false,
        },
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
          boundaryGap: false,
        },
      ],
      series: [
        {
          type: 'line',
          smooth: false,
          areaStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#ECF4FF', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#FFF', // 100% 处的颜色
                  },
                ],
                globalCoord: false, // 缺省为 false
              },
            },
          },
          data: data.results[0].data || [0, 0, 0, 0, 0, 0, 0],
          itemStyle: {
            normal: {
              opacity: 0,
            },
          },
          lineStyle: {
            normal: {
              color: '#E0EEFF',
            },
          },
        },
      ],
      color: ['#3690FF'],
    };
    return option;
  };

  render() {
    const { data } = this.props;
    return <ChartRender data={data} hasData={size(data) > 0} getOption={this.getOption} />;
  }
}

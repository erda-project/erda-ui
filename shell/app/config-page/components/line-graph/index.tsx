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

import React from 'react';
import Echarts from 'charts/components/echarts';
import { functionalColor } from 'common/constants';
import { colorToRgb } from 'common/utils';

const themeColor = {
  dark: '#ffffff',
  light: functionalColor.info,
};

const LineGraph: React.FC<CP_LINE_GRAPH.Props> = (props) => {
  const { props: configProps, data } = props;
  const color = themeColor[configProps.mode ?? 'light'];

  const option = React.useMemo(() => {
    const { dimensions, xAxis, yAxis } = data;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: {
        containLabel: true,
        left: 0,
        bottom: 30,
        top: 10,
        right: 0,
      },
      legend: {
        data: (dimensions ?? []).map((item) => ({
          name: item,
          textStyle: {
            color: colorToRgb(color, 0.6),
          },
          icon: 'reat',
          itemWidth: 12,
          itemHeight: 3,
          type: 'scroll',
        })),
        bottom: true,
      },
      xAxis: {
        data: xAxis.values,
        axisLabel: {
          color: colorToRgb(color, 0.6),
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: colorToRgb(color, 0.3),
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: [colorToRgb(color, 0.1)],
          },
        },
      },
      series: (yAxis ?? []).map((item) => ({
        type: 'line',
        name: item.dimension,
        data: item.values,
      })),
    };
  }, [color, data]);

  return (
    <div className={`px-4 pb-2 ${configProps.className ?? ''}`} style={{ backgroundColor: colorToRgb(color, 0.02) }}>
      <div
        className={`title h-12 flex items-center justify-between ${
          configProps.mode === 'dark' ? 'text-white' : 'text-normal'
        }`}
      >
        {data.title}
      </div>
      <div>
        <Echarts option={option} />
      </div>
    </div>
  );
};

export default LineGraph;

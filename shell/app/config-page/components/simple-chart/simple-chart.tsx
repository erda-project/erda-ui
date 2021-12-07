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

import EChart from 'charts/components/echarts';
import { TextBlockInfo } from 'common';
import echarts from 'echarts/lib/echarts';
import React from 'react';
import './simple-chart.scss';

const getOption = (chart: CP_SIMPLE_CHART.IData['chart']) => {
  return {
    backgroundColor: 'transparent',
    xAxis: {
      show: false,
      type: 'category',
      boundaryGap: false,
      data: chart.xAxis,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      formatter: '{b}<br />{a}&nbsp;&nbsp;&nbsp;{c}',
      axisPointer: {
        type: 'line',
        label: {
          show: true,
          color: '#fff',
        },
      },
    },
    series: chart.series.map((serie, index) => {
      return {
        name: serie.name,
        data: serie.data,
        type: 'line',
        lineStyle: {
          color: 'rgba(179,54,81,1)',
          width: 3,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.5,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(179,54,81,1)',
            },
            {
              offset: 0.9,
              color: 'rgba(255,255,255,0.1)',
            },
          ]),
        },
      };
    }),
  };
};

const SimpleChart = (props: CP_SIMPLE_CHART.Props) => {
  const { execOperation, data, props: configProps, operations } = props;
  const { main, sub, compareText, compareValue, chart } = data || {};
  const { style } = configProps || {};

  return (
    <div className="cp-simple-chart flex items-center p-4" style={style}>
      <TextBlockInfo className="flex justify-center" main={main} sub={sub} desc={compareText + compareValue} />
      <EChart option={getOption(chart)} notMerge style={{ height: 64 }} className="flex-1" />
    </div>
  );
};

export default SimpleChart;

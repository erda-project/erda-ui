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
import { map, size } from 'lodash';
import moment from 'moment';
import { ChartRender } from 'charts';
import i18n from 'i18n';

const secondToMinute = (s, type) => {
  const m = Math.floor(s / 60);
  if (type === 'second') return `${m}m${s - m * 60}s`;
  return (m + (s - m * 60) / 60);
};

export default class OverviewReportLineChart extends React.Component {
  getOption = () => {
    const { data } = this.props;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (dt) => {
          const tip = dt[0];
          return `${tip.name}<br />${tip.seriesName}:${secondToMinute(tip.value * 60, 'second')}`;
        },
      },
      legend: {
        data: [i18n.t('project:average time per day')],
        right: 20,
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: map(data.time, (value) => moment(value * 1000).format('MM/DD')) || [],
          splitLine: { show: false },
          axisLabel: {
            fontSize: 10,
            interval: 0,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '分',
          nameTextStyle: {
            color: '#999',
          },
          axisLine: {
            show: true,
            lineStyle: { color: '#E8E8E8' },
          },
        },
      ],
      series: [
        {
          name: i18n.t('project:average time per day'),
          type: 'line',
          smooth: false,
          markLine: {
            silent: true,
            lineStyle: {
              color: 'gray',
            },
            label: {
              normal: {
                show: true,
                position: 'middle',
                formatter: (params) => {
                  return `${params.name}: ${params.data.yAxis}`;
                },
              },
            },
            // data: [{ name: '平均使用', value: 100 }].map(({ name, value }) => ([{ x: '15%', yAxis: value, name }, { x: '90%', yAxis: value }])),
          },
          areaStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#78B2FF', // 0% 处的颜色
                }, {
                  offset: 1, color: '#FFF', // 100% 处的颜色
                }],
                globalCoord: false, // 缺省为 false
              },
            },
          },
          data: map(data.results[0].data, (item) => secondToMinute(item)) || [0, 0, 0, 0, 0, 0, 0],
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

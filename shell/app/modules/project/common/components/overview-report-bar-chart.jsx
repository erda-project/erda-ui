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

export default class OverviewReportBarChart extends React.Component {
  getOption = () => {
    const { data } = this.props;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        data: [i18n.t('project:deployment succeeded'), i18n.t('project:deployment failed')],
        align: 'right',
        itemWidth: 14,
        itemHeight: 14,
        right: 10,
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: map(data.time, (value) => moment(value * 1000).format('MM/DD')) || [],
        splitLine: { show: false },
        axisLabel: {
          fontSize: 10,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: i18n.t('times'),
        nameTextStyle: {
          color: '#999',
        },
        axisLine: {
          show: true,
          lineStyle: { color: '#E8E8E8' },
        },
      },
      series: [
        {
          name: i18n.t('project:deployment failed'),
          type: 'bar',
          stack: i18n.t('project:total'),
          barWidth: '20%',
          label: {
            normal: {
              show: false,
              position: 'insideRight',
            },
          },
          data: data.results[1].data || [0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: i18n.t('project:deployment succeeded'),
          type: 'bar',
          stack: i18n.t('project:total'),
          barWidth: '20%',
          label: {
            normal: {
              show: false,
              position: 'insideRight',
            },
          },
          data: data.results[0].data || [0, 0, 0, 0, 0, 0, 0],
        },
      ],
      color: ['#F44638', '#308DFF'],
    };
    return option;
  };

  render() {
    // const { data } = this.props;
    const opts = {
      data: [
        [
          {
            name: '',
            key: '',
            data: [
              { name: 'satisfied', count: 347, percent: 0.916 },
              { name: 'tolerated', count: 32, percent: 0.084 },
              { name: 'frustrated', count: 0, percent: 0 },
            ],
          },
        ],
      ],
    };
    return <ChartRender {...opts} hasData={size(opts.data) > 0} getOption={this.getOption} />;
  }
}

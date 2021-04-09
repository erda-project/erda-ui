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
import { ChartRender } from 'charts';
import i18n from 'i18n';

export default class OverviewReportGaugeChart extends React.Component {
  getOption = () => {
    const { data = 0 } = this.props;
    const rate = (data * 100).toFixed(1);
    const option = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%',
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {},
        },
      },
      series: [
        {
          type: 'gauge',
          splitNumber: 10,
          data: [{ value: rate, name: i18n.t('project:success rate') }],
          splitLine: {
            length: 20,
            lineStyle: {
              color: '#fff',
              width: 1,
            },
          },
          axisLabel: {
            distance: 0,
            color: '#000',
            formatter: value => (value % 20 === 0 ? value : ''),
          },
          axisTick: {
            splitNumber: 5,
            length: 8,
            lineStyle: {
              color: '#fff',
            },
          },
          pointer: {
            show: false,
          },
          title: {
            offsetCenter: [0, '30%'],
            color: '#999',
          },
          detail: {
            offsetCenter: [0, '0%'],
            formatter: '{value}%',
            color: '#000',
            fontSize: 25,
          },
          axisLine: {
            lineStyle: {
              color: [[rate / 100, rate < 50 ? '#F44638' : '#308DFF'], [1, '#E0E0E0']],
              width: 20,
            },
          },
        },
      ],
    };
    return option;
  };

  render() {
    return <ChartRender data={[]} hasData getOption={this.getOption} />;
  }
}

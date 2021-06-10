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
import i18n from 'i18n';
import { map, round } from 'lodash';
import { Spin, Row, Col } from 'app/nusi';
import { ChartRender } from 'charts';
import { ChartContainer } from 'charts/utils';
import { CLUSTER_RESOURCES_PROPORTION_MAP } from 'dcos/common/config';

interface IProps {
  statisticsLabels?: any;
  machineList: any[];
}

const ResourcesProportionChart = ({ statisticsLabels: { totalHosts, labelsInfo = {} } }: IProps) => {
  const data: any[] = map(labelsInfo, (value, name) => ({
    ...value,
    name,
    totalHosts,
  }));

  const commonOption = {
    barMaxWidth: '50%',
    grid: {
      top: '10%',
      bottom: 0,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        splitLine: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          rotate: 40,
        },
        data: map(data, (item) => item.name),
      },
    ],
  };

  const getOption = (type: string) => {
    const { totalName, totalValue, valueName, value, unit, schedulableUnit, schedulableKey, schedulableName } =
      CLUSTER_RESOURCES_PROPORTION_MAP[type];

    return {
      ...commonOption,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: Record<string, any> | any[]) => {
          const { name } = params[0];
          const seriesTpl = map(
            params,
            ({ marker, seriesName, value: seriesValue }: any) => `${marker}${seriesName}: ${seriesValue}<br />`,
          );
          let schedulableValue = labelsInfo[name][schedulableKey];
          if (schedulableUnit === '%') {
            schedulableValue = round(parseFloat(schedulableValue) * 100, 2);
          }

          return `
            ${name} ${schedulableName ? `<${schedulableName}: ${schedulableValue || '--'}${schedulableUnit}>` : ''}
            <br />
            ${seriesTpl}
          `;
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: `{value}${unit}`,
          },
        },
      ],
      series: [
        {
          name: totalName,
          type: 'bar',
          data: map(data, (item) => item[totalValue]),
          barGap: '-100%',
          itemStyle: {
            normal: {
              color: '#ddd',
            },
          },
          markLine: {
            data: [
              {
                type: 'max',
                name: i18n.t('dcos:maximum value'),
              },
            ],
            label: {
              position: 'middle',
              formatter: `${totalName}: {c}${unit}`,
            },
            lineStyle: {
              color: 'rgba(0, 0, 0, .4)',
            },
          },
        },
        {
          name: valueName,
          type: 'bar',
          data: map(data, (item) => item[value]),
        },
      ],
    };
  };

  return (
    <Spin spinning={false}>
      <Row gutter={24}>
        <Col xl={8} md={12}>
          <ChartContainer title={i18n.t('dcos:host assignment')}>
            <ChartRender data={data} hasData={data.length > 0} getOption={() => getOption('host')} />
          </ChartContainer>
        </Col>
        <Col xl={8} md={12}>
          <ChartContainer title={i18n.t('org:CPU allocation')}>
            <ChartRender data={data} hasData={data.length > 0} getOption={() => getOption('cpu')} />
          </ChartContainer>
        </Col>
        <Col xl={8} md={12}>
          <ChartContainer title={i18n.t('org:MEM allocation')}>
            <ChartRender data={data} hasData={data.length > 0} getOption={() => getOption('mem')} />
          </ChartContainer>
        </Col>
      </Row>
    </Spin>
  );
};

export default ResourcesProportionChart;

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
import { Col, Row } from 'antd';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import { TimeSelectWithStore } from 'msp/components/time-select';
import { auxiliaryColorMap, functionalColor } from 'common/constants';
import DiceConfigPage from 'config-page';
import monitorCommonStore from 'common/stores/monitorCommon';
import { getAnalyzerOverview } from 'msp/services/service-list';
import routeInfoStore from 'core/stores/route';
import EChart from 'charts/components/echarts';
import { groupBy } from 'lodash';
import moment from 'moment';
import { genLinearGradient, newColorMap } from 'charts/theme';
import i18n from 'i18n';
import { getFormatter } from 'charts/utils';
import './index.scss';
import topologyStore from 'msp/env-overview/topology/stores/topology';
import TopologyComp from 'msp/env-overview/topology/pages/topology/component/topology-comp';
import { Cards, TopologyOverviewWrapper } from 'msp/env-overview/topology/pages/topology/component/topology-overview';

const formatTime = getFormatter('TIME', 'ns');

const chartConfig = [
  {
    title: i18n.t('msp:interface rps'),
    key: 'RPS',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${count} reqs/s`;
    },
  },
  {
    title: i18n.t('response time'),
    key: 'AvgDuration',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${formatTime.format(count * 1000000)}`;
    },
  },
  {
    title: i18n.t('msp:HTTP status'),
    key: 'HttpCode',
  },
  {
    title: i18n.t('msp:request error rate'),
    key: 'ErrorRate',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${count} %`;
    },
  },
];

const axis = {
  splitLine: {
    show: false,
  },
};

const OverView = () => {
  const serviceId = serviceAnalyticsStore.useStore((s) => s.serviceId);
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const { clearMonitorTopology } = topologyStore.reducers;
  const { getMonitorTopology } = topologyStore.effects;
  const [topologyData] = topologyStore.useStore((s) => [s.topologyData]);
  const [charts] = getAnalyzerOverview.useState();
  React.useEffect(() => {
    if (serviceId) {
      getMonitorTopology({
        startTime: range.startTimeMs,
        endTime: range.endTimeMs,
        terminusKey: tenantId,
        tags: [`service:${serviceId}`],
      });
      getAnalyzerOverview.fetch({
        tenantId,
        view: 'topology_service_node',
        serviceIds: [serviceId],
        startTime: range.startTimeMs,
        endTime: range.endTimeMs,
      });
    }
    return () => {
      clearMonitorTopology();
    };
  }, [serviceId, range, tenantId]);
  const chartsData = React.useMemo(() => {
    const { views } = charts?.list[0] ?? {};
    const legendData = {};
    const xAxisData = {};
    const seriesData = {};
    (views || []).forEach(({ type, view }) => {
      const dimensions = groupBy(view, 'dimension');
      const dimensionsArr = Object.keys(dimensions);
      legendData[type] = dimensionsArr;
      seriesData[type] = [];
      dimensionsArr.forEach((name) => {
        xAxisData[type] = dimensions[name].map((t) => moment(t.timestamp).format('YYYY-MM-DD HH:mm:ss'));
        let series: Record<string, any> = {
          name,
          data: dimensions[name].map((t) => (type === 'AvgDuration' ? t.value / 1000000 : t.value)),
        };
        if (!(type === 'HttpCode' && name !== '200')) {
          series = {
            ...series,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: newColorMap.primary4,
                },
              },
            },
            areaStyle: {
              normal: {
                color: genLinearGradient(newColorMap.primary4),
              },
            },
          };
        }
        seriesData[type].push(series);
      });
    });
    return { legendData, xAxisData, seriesData };
  }, [charts]);

  const overviewList = React.useMemo(() => {
    const { metric } = topologyData.nodes?.find((t) => t.serviceId === serviceId) ?? ({} as TOPOLOGY.INode);
    return [
      {
        key: 'rps',
        label: i18n.t('msp:average throughput'),
        value: metric?.rps,
        unit: 'reqs/s',
      },
      {
        key: 'rt',
        label: i18n.t('msp:average response time'),
        value: metric?.rt,
        unit: 'ms',
      },
      {
        key: 'error_rate',
        label: i18n.t('msp:request error rate'),
        value: metric?.error_rate,
        unit: '%',
      },
      {
        key: 'running',
        label: i18n.t('msp:service instance'),
        value: metric?.running,
      },
    ];
  }, [topologyData, serviceId]);

  if (!serviceId) {
    return <NoServicesHolder />;
  }

  return (
    <div className="service-overview bg-white">
      <div className="h-12 flex justify-end items-center px-4 bg-lotion">
        <TimeSelectWithStore className="m-0" />
      </div>
      <div className="service-overview-topology flex flex-col overflow-hidden">
        <div className="h-12 flex justify-start items-center px-4 bg-white-02 text-white">
          {i18n.t('msp:service topology')}
        </div>
        <div className="flex-1 flex topology-wrapper">
          <TopologyOverviewWrapper>
            <div className="pt-3">
              <Cards list={overviewList} />
            </div>
          </TopologyOverviewWrapper>
          <div className="flex-1 h-full relative">
            {topologyData.nodes?.length ? (
              <TopologyComp allowScroll={false} data={topologyData} filterKey={'node'} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="h-12 flex justify-start items-center px-4 bg-lotion text-default">
        {i18n.t('msp:service request overview')}
      </div>
      <div>
        <Row>
          {chartConfig.map((item) => {
            const currentOption = {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              yAxis: {
                ...axis,
                type: 'value',
                splitLine: {
                  show: true,
                },
              },
              grid: {
                top: '5%',
                left: '10%',
              },
              xAxis: {
                ...axis,
                data: chartsData.xAxisData[item.key] ?? [],
              },
              legend: {
                data: (chartsData.legendData[item.key] ?? []).map((t) => ({
                  name: t,
                })),
                pageIconSize: 12,
                bottom: '1%',
              },
              tooltip: {
                trigger: 'axis',
                formatter: item.formatter,
              },
              series: (chartsData.seriesData[item.key] ?? []).map((t) => ({
                ...t,
                type: 'line',
                smooth: false,
              })),
            };
            return (
              <Col span={12} className="px-4">
                <div className="mt-4 mb-2 px-4 text-default-8">{item.title}</div>
                <div className="px-4" style={{ height: '170px' }}>
                  <EChart style={{ width: '100%', height: '160px', minHeight: 0 }} option={currentOption} />
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
      <div className="h-12 flex justify-start items-center px-4 bg-lotion text-default">
        {i18n.t('msp:service invocation analysis')}
      </div>
      <DiceConfigPage
        showLoading
        scenarioType="service-overview"
        scenarioKey="service-overview"
        forceUpdateKey={['inParams']}
        inParams={{ tenantId, serviceId, startTime: range.startTimeMs, endTime: range.endTimeMs }}
        fullHeight={false}
        customProps={{
          topN: {
            props: {
              theme: [
                {
                  color: functionalColor.actions,
                  titleIcon: 'jiekoutuntu',
                },
                {
                  color: functionalColor.success,
                  titleIcon: 'jiekoutiaoyong',
                },
                {
                  color: functionalColor.error,
                  titleIcon: 'jiekoucuowushuai',
                },
                {
                  color: auxiliaryColorMap.purple.deep,
                  titleIcon: 'kehuduantiaoyong',
                },
                {
                  color: functionalColor.empty,
                  titleIcon: 'SQLtiaoyong',
                },
                {
                  color: functionalColor.warning,
                  titleIcon: 'fuwuyichang',
                },
              ],
            },
          },
        }}
      />
    </div>
  );
};

export default OverView;

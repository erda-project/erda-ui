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
import { Col, Row, Spin, Tooltip } from 'antd';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import { TimeSelectWithStore } from 'msp/components/time-select';
import DiceConfigPage from 'config-page';
import monitorCommonStore from 'common/stores/monitorCommon';
import routeInfoStore from 'core/stores/route';
import { reduce } from 'lodash';
import i18n from 'i18n';
import { getMonitorTopology } from 'msp/env-overview/topology/services/topology';
import TopologyComp from 'msp/env-overview/topology/pages/topology/component/topology-comp';
import { Cards, TopologyOverviewWrapper } from 'msp/env-overview/topology/pages/topology/component/topology-overview';
import ErdaIcon from 'common/components/erda-icon';
import { useFullScreen } from 'common/use-hooks';
import AnalyzerChart from 'msp/components/analyzer-chart';
import themeColor from 'app/theme-color.mjs';
import './index.scss';

const chartConfig = [
  {
    title: i18n.t('msp:throughput'),
    key: 'rps_chart',
  },
  {
    title: i18n.t('response time'),
    key: 'avg_duration_chart',
  },
  {
    title: i18n.t('msp:HTTP status'),
    key: 'http_code_chart',
  },
  {
    title: i18n.t('msp:request error rate'),
    key: 'error_rate_chart',
  },
];
const topNConfig = [
  {
    key: 'pathRpsMaxTop5',
    color: themeColor['blue-deep'],
    icon: 'jiekoutuntu',
  },
  {
    key: 'pathSlowTop5',
    color: themeColor.success,
    icon: 'jiekoutiaoyong',
  },
  {
    key: 'pathErrorRateTop5',
    color: themeColor.error,
    icon: 'jiekoucuowushuai',
  },
  {
    key: 'pathClientRpsMaxTop5',
    color: themeColor['purple-deep'],
    icon: 'kehuduantiaoyong',
  },
  {
    key: 'sqlSlowTop5',
    color: themeColor.default,
    icon: 'SQLtiaoyong',
  },
  {
    key: 'exceptionCountTop5',
    color: themeColor.warning,
    icon: 'fuwuyichang',
  },
];

const topNMap = reduce(
  topNConfig,
  (prev, next) => {
    return {
      ...prev,
      [`service-overview@${next.key}`]: {
        props: {
          theme: [
            {
              titleIcon: next.icon,
              color: next.color,
            },
          ],
        },
      },
    };
  },
  {},
);

const OverView = () => {
  const [serviceId, requestCompleted] = serviceAnalyticsStore.useStore((s) => [s.serviceId, s.requestCompleted]);
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const [topologyData, isLoading] = getMonitorTopology.useState();
  const serviceTopologyRef = React.useRef<HTMLDivElement>(null);
  const [isFullScreen, { toggleFullscreen }] = useFullScreen(serviceTopologyRef);

  React.useEffect(() => {
    if (serviceId) {
      getMonitorTopology.fetch({
        startTime: range.startTimeMs,
        endTime: range.endTimeMs,
        terminusKey: tenantId,
        tags: [`service:${serviceId}`],
      });
    }
  }, [serviceId, range, tenantId]);

  const overviewList = React.useMemo(() => {
    const { metric } = topologyData?.nodes?.find((t) => t.serviceId === serviceId) ?? ({} as TOPOLOGY.INode);
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

  const handleScreen = () => {
    toggleFullscreen();
  };

  if (!serviceId && requestCompleted) {
    return <NoServicesHolder />;
  }

  return (
    <div className="service-overview">
      <div className="h-12 flex justify-end items-center px-4">
        <TimeSelectWithStore className="m-0" />
      </div>
      <Spin spinning={isLoading}>
        <div
          className={`service-overview-topology flex flex-col overflow-hidden ${isFullScreen ? '' : 'fixed-height'}`}
          ref={serviceTopologyRef}
        >
          <div className="h-12 flex justify-between items-center px-4 bg-white-02 text-white font-medium">
            {i18n.t('msp:service topology')}
            <Tooltip
              getPopupContainer={(e) => e?.parentNode as HTMLElement}
              placement={isFullScreen ? 'bottomRight' : undefined}
              title={isFullScreen ? i18n.t('exit full screen') : i18n.t('full screen')}
            >
              <ErdaIcon
                onClick={handleScreen}
                type={isFullScreen ? 'off-screen-one' : 'full-screen-one'}
                className="text-white-4 hover:text-white cursor-pointer"
              />
            </Tooltip>
          </div>
          <div className="flex-1 flex topology-wrapper">
            <TopologyOverviewWrapper>
              <div className="pt-3">
                <Cards list={overviewList} canSelect={false} />
              </div>
            </TopologyOverviewWrapper>
            <div className="flex-1 h-full relative">
              {topologyData?.nodes?.length ? (
                <TopologyComp allowScroll={false} data={topologyData} filterKey={'node'} />
              ) : null}
            </div>
          </div>
        </div>
      </Spin>
      <div className="bg-white">
        <div className="h-12 flex justify-start items-center px-4 bg-lotion text-default font-medium mt-2">
          {i18n.t('msp:service request overview')}
        </div>
        <div className="px-4 pt-1 pb-3">
          <Row gutter={8}>
            {chartConfig.map((item) => {
              return (
                <Col span={12} className="my-1" key={item.key}>
                  <div className="bg-default-01">
                    <div className="pt-3 mb-3 px-4 text-default-8">{item.title}</div>
                    <div className="px-4" style={{ height: '170px' }}>
                      <AnalyzerChart
                        scope="serviceOverview"
                        style={{ width: '100%', height: '160px', minHeight: 0 }}
                        view={item.key}
                        serviceId={serviceId}
                        tenantId={tenantId}
                        grid={{
                          top: '17%',
                          left: '10%',
                        }}
                      />
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>

      <div className="bg-white">
        <div className="h-12 flex justify-start items-center px-4 bg-lotion text-default font-medium  mt-2 mb-1">
          {i18n.t('msp:service invocation analysis')}
        </div>
        {serviceId && tenantId ? (
          <DiceConfigPage
            wrapperClassName="px-2"
            showLoading
            scenarioType="service-overview"
            scenarioKey="service-overview"
            forceUpdateKey={['inParams']}
            inParams={{ tenantId, serviceId, startTime: range.startTimeMs, endTime: range.endTimeMs }}
            fullHeight={false}
            customProps={{
              page: {
                props: {
                  className: 'px-2',
                },
              },
              grid: {
                props: {
                  gutter: 8,
                  span: [8, 8, 8, 8, 8, 8],
                },
              },
              ...topNMap,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
export default OverView;

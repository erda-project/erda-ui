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
import ServiceListDashboard from './service-list-dashboard';
import routeInfoStore from 'core/stores/route';
import NodeEle from 'msp/env-overview/topology/pages/topology/node-item';
import { setNodeUniqId } from 'msp/env-overview/topology/pages/topology/topology';
import LinkText, { linkTextHoverAction } from 'msp/env-overview/topology/pages/topology/link-text';
import TopologyChart from 'msp/env-overview/topology/pages/topology/components';
import monitorCommonStore from 'common/stores/monitorCommon';
import { TimeSelectWithStore } from 'msp/components/time-select';
import topologyStore from 'msp/env-overview/topology/stores/topology';
import { useLoading } from 'core/stores/loading';
import { useUnmount, useMount } from 'react-use';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import { ScaleSelector } from 'msp/env-overview/topology/pages/topology/components/scaleSelector';
import { EmptyHolder } from 'common';
import './index.scss';

export default () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const globalTimeSelectSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const serviceId = serviceAnalyticsStore.useStore((s) => s.serviceId);
  const { range } = globalTimeSelectSpan;
  const [isFetching] = useLoading(topologyStore, ['getMonitorTopology']);
  const [useData, setUseData] = React.useState({});
  const [sourceData, scale, topologySize] = topologyStore.useStore((s) => [s.topologyData, s.scale, s.topologySize]);
  const [topologyData, setTopologyData] = React.useState({} as TOPOLOGY.ITopologyResp);
  const { clearMonitorTopology, setScale } = topologyStore.reducers;
  const { getMonitorTopology } = topologyStore.effects;

  const getData = React.useCallback(() => {
    const { startTimeMs, endTimeMs } = range || {};
    const query = {
      startTime: startTimeMs,
      endTime: endTimeMs,
      terminusKey: params.terminusKey,
      tags: [`service:${serviceId}`],
    };
    getMonitorTopology(query);
  }, [getMonitorTopology, params.terminusKey, range, serviceId]);

  useUnmount(() => {
    setScale(0.8);
    clearMonitorTopology();
  });

  React.useEffect(() => {
    if (params.terminusKey) {
      getData();
    }
  }, [params.terminusKey, getData]);

  React.useEffect(() => {
    if (JSON.stringify(topologyData) !== '{}') {
      setUseData(topologyData);
    } else {
      setUseData({ nodes: [] });
    }
  }, [topologyData]);

  React.useEffect(() => {
    setTopologyData(setNodeUniqId(sourceData));
  }, [sourceData]);

  const nodeExternalParam = {
    terminusKey: params.terminusKey,
    range,
    linkTextHoverAction,
    originData: useData,
  };

  return (
    <div className="service-analyze flex flex-col h-full">
      <div className="flex items-center justify-end mb-3">
        <ScaleSelector scale={scale} onChange={(val) => setScale(val)} />
        <TimeSelectWithStore className="m-0 ml-4" />
      </div>
      {serviceId ? (
        <div className="overflow-auto flex-1 service-overview">
          <div style={{ height: topologySize.containerHeight, maxHeight: '80%', minHeight: '40%' }} className="flex">
            <TopologyChart
              nodeExternalParam={nodeExternalParam}
              isFetching={isFetching}
              data={useData}
              setScale={setScale}
              scale={scale}
              nodeEle={NodeEle}
              linkTextEle={LinkText}
            />
          </div>
          <ServiceListDashboard dashboardId="service_analysis-translation" serviceId={serviceId} />
        </div>
      ) : (
        <EmptyHolder relative />
      )}
    </div>
  );
};

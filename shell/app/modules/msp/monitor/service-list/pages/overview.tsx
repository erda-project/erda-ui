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
import NodeEle from 'msp/monitor/topology/pages/topology/node-item';
import { setNodeUniqId } from 'msp/monitor/topology/pages/topology/topology';
import LinkText, { linkTextHoverAction } from 'msp/monitor/topology/pages/topology/link-text';
import TopologyChart from 'msp/monitor/topology/pages/topology/components';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyStore from 'topology/stores/topology';
import { useLoading } from 'core/stores/loading';
import { isEmpty } from 'lodash';
import { useUnmount, useMount } from 'react-use';
import { TimeSelectWithStore } from 'msp/components/time-select';

export default () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const [isFetching] = useLoading(topologyStore, ['getMonitorTopology']);
  const [useData, setUseData] = React.useState({});
  const [sourceData, scale] = topologyStore.useStore((s) => [
    s.topologyData,
    s.scale,
    s.topologyTags,
    s.tagOptionsCollection,
  ]);
  const [topologyData, setTopologyData] = React.useState({} as TOPOLOGY.ITopologyResp);
  const { clearMonitorTopology, setScale } = topologyStore.reducers;
  const { getMonitorTopology } = topologyStore.effects;

  useMount(() => {
    setScale(0.8);
  });

  useUnmount(() => {
    clearMonitorTopology();
  });

  React.useEffect(() => {
    const getData = () => {
      const { startTimeMs, endTimeMs } = timeSpan;
      const query = {
        startTime: startTimeMs,
        endTime: endTimeMs,
        terminusKey: params.terminusKey,
        tags: [`service:${params.serviceName}`],
      };
      getMonitorTopology(query);
    };

    if (params.terminusKey) {
      getData();
    }
  }, [timeSpan, params.terminusKey, getMonitorTopology, params.serviceName]);

  React.useEffect(() => {
    if (!isEmpty(topologyData)) {
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
    timeSpan,
    linkTextHoverAction,
    originData: useData,
  };

  return (
    <div className="service-analyze flex flex-col h-full">
      <div className="flex justify-end items-center mb-3">
        <TimeSelectWithStore className="m-0" />
      </div>
      <div className="overflow-auto flex-1">
        <div className="topology-content flex flex-1">
          <TopologyChart
            nodeExternalParam={nodeExternalParam}
            isFetching={isFetching}
            data={useData}
            setScale={setScale}
            scale={scale}
            nodeEle={NodeEle}
            linkTextEle={LinkText}
          />
          <div className="flex-2">
            <ServiceListDashboard dashboardId="service_analysis-instants" />
          </div>
        </div>
        <ServiceListDashboard dashboardId="service_analysis-translation" />
      </div>
    </div>
  );
};

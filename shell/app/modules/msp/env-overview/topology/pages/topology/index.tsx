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
import TopologyComp, { ITopologyRef } from 'msp/env-overview/topology/pages/topology/component/topology-comp';
import TopologyOverview, { INodeKey } from 'msp/env-overview/topology/pages/topology/component/topology-overview';
import TopologyDetail from 'msp/env-overview/topology/pages/topology/component/topology-detail';
import { ContractiveFilter } from 'common';
import i18n from 'i18n';
import monitorCommonStore from 'common/stores/monitorCommon';
import routeInfoStore from 'core/stores/route';
import { Spin } from 'antd';
import { getMonitorTopology } from 'msp/env-overview/topology/services/topology';
import { getServices } from 'msp/services/service-list';
import { TimeSelectWithStore } from 'msp/components/time-select';
import './index.scss';

const Topology = () => {
  const [filterTags, setFilterTags] = React.useState({ service: '' });
  const [nodeType, setNodeType] = React.useState<INodeKey>('node');
  const [currentNode, setCurrentNode] = React.useState<TOPOLOGY.TopoNode['metaData']>(
    {} as TOPOLOGY.TopoNode['metaData'],
  );
  const topologyRef = React.useRef<ITopologyRef>(null);
  const params = routeInfoStore.useStore((s) => s.params);
  const [range] = monitorCommonStore.useStore((s) => [s.globalTimeSelectSpan.range, s.globalTimeSelectSpan.data]);
  const serverListData = getServices.useData();
  const serviceList = serverListData?.list || [];
  const [topologyData, isLoading] = getMonitorTopology.useState();

  React.useEffect(() => {
    if (params.terminusKey) {
      const { startTimeMs, endTimeMs } = range;
      const tags = filterTags.service ? [`service:${filterTags.service}`] : [];

      const query = {
        startTime: startTimeMs,
        endTime: endTimeMs,
        terminusKey: params.terminusKey,
        tags,
      };
      getMonitorTopology.fetch(query);
    }
  }, [range, params.terminusKey, filterTags]);

  React.useEffect(() => {
    getServices.fetch({
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
      pageNo: 1,
      pageSize: 1000,
      tenantId: params?.terminusKey,
    });
  }, [range]);

  const conditionsFilter = React.useMemo(
    () => [
      {
        type: 'select',
        key: 'service',
        label: i18n.t('service name'),
        fixed: true,
        showIndex: 0,
        haveFilter: true,
        emptyText: i18n.t('dop:all'),
        customProps: {
          mode: 'single',
        },
        options: serviceList.map((item: MSP_SERVICES.SERVICE_LIST_ITEM) => ({ value: item.id, label: item.name })),
      },
    ],
    [serviceList],
  );

  const handleSelectNodeType = (key: INodeKey) => {
    setNodeType(key);
  };

  const handleClickNode = (data: TOPOLOGY.TopoNode['metaData']) => {
    setCurrentNode(data);
  };

  return (
    <div className="topology h-full">
      <Spin className="spin" spinning={isLoading}>
        <div className="h-full flex flex-col">
          <div className="topology-filter flex justify-between items-center h-12 bg-white-02 px-4">
            <ContractiveFilter
              delay={1000}
              values={filterTags}
              conditions={conditionsFilter}
              onChange={(e) => {
                setFilterTags(e);
              }}
            />
            <TimeSelectWithStore className="ml-3" theme="dark" />
          </div>
          <div className="flex-1 flex min-h-0">
            <TopologyOverview data={topologyData} onClick={handleSelectNodeType} jumpService />
            <div className="flex-1 topology-container relative min-w-0">
              {topologyData?.nodes.length ? (
                <TopologyComp
                  ref={topologyRef}
                  key={nodeType}
                  data={topologyData}
                  filterKey={nodeType}
                  clockNode={handleClickNode}
                  defaultZoom={0.6}
                  jumpService
                />
              ) : null}
            </div>
          </div>
        </div>
        <TopologyDetail
          className="absolute h-full top-0"
          data={currentNode}
          onCancel={() => {
            topologyRef.current?.cancelSelectNode();
            setCurrentNode({});
          }}
        />
      </Spin>
    </div>
  );
};

export default Topology;

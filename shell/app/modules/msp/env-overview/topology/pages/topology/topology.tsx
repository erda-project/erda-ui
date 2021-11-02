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

/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, map, get } from 'lodash';
import React from 'react';
import { Row, Col, Tooltip, Button } from 'antd';
import { ContractiveFilter } from 'common';
import i18n from 'i18n';
import NodeEle from './node-item';
import LinkText, { linkTextHoverAction } from './link-text';
import TopologyChart from './components';
import TopologyDashboard from '../topology-dashboard';
import ServiceMeshDrawer from '../service-mesh/service-mesh-drawer';
import { ScaleSelector } from 'msp/components/scaleSelector';
import topologyStore from 'msp/env-overview/topology/stores/topology';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyServiceStore from 'msp/stores/topology-service-analyze';
import { useLoading } from 'core/stores/loading';
import { useUnmount, useMount } from 'react-use';
import { TimeSelectWithStore } from 'msp/components/time-select';
import { MenuUnfold } from '@icon-park/react';
import './topology.scss';

const emptyObj = { nodes: [] };

// 拓扑节点中的id，存在非法字符（不能作为id使用），重置id；
export const setNodeUniqId = (data: TOPOLOGY.ITopologyResp) => {
  const { nodes = [] } = data || {};
  let nodeId = 0;
  const allIds = {};
  const reNodes = map(nodes, (node) => {
    const { id, parents = [] } = node;
    if (!allIds[id]) {
      nodeId += 1;
      allIds[id] = `node-${nodeId}`;
    }
    return {
      ...node,
      originId: id,
      id: allIds[id],
      parents: map(parents, (parent) => {
        const { id: pId } = parent;
        if (!allIds[pId]) {
          nodeId += 1;
          allIds[pId] = `node-${nodeId}`;
        }
        return {
          ...parent,
          id: allIds[pId],
          originId: pId,
        };
      }),
    };
  });
  return {
    ...data,
    nodes: reNodes,
  };
};

const Topology = () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const { range } = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const { getProjectApps } = monitorCommonStore.effects;
  const [isFetching] = useLoading(topologyStore, ['getMonitorTopology']);
  const { clearMonitorTopology, setScale } = topologyStore.reducers;
  const { setActivedNode } = topologyServiceStore;
  const { getMonitorTopology, getTopologyTags, getTagsOptions } = topologyStore.effects;
  const [sourceData, scale, topologyTags, tagOptionsCollection] = topologyStore.useStore((s) => [
    s.topologyData,
    s.scale,
    s.topologyTags,
    s.tagOptionsCollection,
  ]);

  const [topologyData, setTopologyData] = React.useState({} as TOPOLOGY.ITopologyResp);
  const [useData, setUseData] = React.useState({} as TOPOLOGY.ITopologyResp);
  const [filterTags, setFilterTags] = React.useState({});
  const [serviceMeshVis, setServiceMeshVis] = React.useState(false);
  const [chosenNode, setChosenNode] = React.useState(null as TOPOLOGY.INode | null);
  const [serviceMeshType, setServiceMeshType] = React.useState('');
  const [proportion, setProportion] = React.useState([24, 0]);
  const toggleFold = (fold: boolean) => {
    if (fold) {
      setProportion([24, 0]);
    } else {
      setProportion([16, 8]);
    }
  };
  const isFolded = proportion[1] !== 0;
  useMount(() => {
    getProjectApps();
  });

  useUnmount(() => {
    clearMonitorTopology();
  });

  React.useEffect(() => {
    setTopologyData(setNodeUniqId(sourceData));
  }, [sourceData]);

  const getData = () => {
    const { startTimeMs, endTimeMs } = range;

    // filterTags = { a: ['a1', 'a2'], b: ['b1']}
    // 需要转换成 ['a:a1', 'a:a2', 'b:b1']
    const tags = Object.keys(filterTags || {}).reduce(
      (acc: string[], key) => [...acc, ...(filterTags[key] || []).map((x: string) => `${key}:${x}`)],
      [],
    );

    const query = {
      startTime: startTimeMs,
      endTime: endTimeMs,
      terminusKey: params.terminusKey,
      tags,
    };
    getMonitorTopology(query);
  };

  React.useEffect(() => {
    const { startTimeMs, endTimeMs } = range;
    const query = {
      startTime: startTimeMs,
      endTime: endTimeMs,
      terminusKey: params.terminusKey,
    };

    topologyTags.forEach((item: TOPOLOGY.ISingleTopologyTags) => {
      // 这个接口可能有问题，可能不需要依赖于startTime和endTime
      getTagsOptions({ ...query, tag: item.tag });
    });
  }, [topologyTags, range]);

  React.useEffect(() => {
    if (params.terminusKey) {
      getTopologyTags({ terminusKey: params.terminusKey }).then((res) => {
        const initialTags = {};
        res.forEach((item: TOPOLOGY.ISingleTopologyTags) => {
          Object.assign(initialTags, { [item.tag]: [] });
        });

        setFilterTags(initialTags);
      });
    }
  }, [params.terminusKey]);

  React.useEffect(() => {
    setActivedNode(undefined);
    if (params.terminusKey) {
      getData();
    }
  }, [range, params.terminusKey, filterTags]);

  React.useEffect(() => {
    if (!isEmpty(topologyData)) {
      setUseData(topologyData);
    } else {
      setUseData(emptyObj);
    }
  }, [topologyData]);

  const toggleDrawer = (_type?: string, _node?: any) => {
    setServiceMeshType(_type || '');
    setChosenNode(_node);
    setServiceMeshVis(!serviceMeshVis);
  };

  const clickNode = (detail: any) => {
    setActivedNode(detail);
  };

  const nodeExternalParam = {
    terminusKey: params.terminusKey,
    timeSpan: range,
    linkTextHoverAction,
    originData: useData,
    toggleDrawer,
  };

  const conditionsFilter = React.useMemo(
    () =>
      topologyTags.map((item: TOPOLOGY.ISingleTopologyTags) => ({
        type: 'select',
        key: item.tag,
        label: item.label,
        fixed: item.tag === 'application',
        showIndex: 0,
        haveFilter: true,
        emptyText: i18n.t('dop:all'),
        options: (get(tagOptionsCollection, item.tag, []) || []).map((x: string) => ({ value: x, label: x })),
      })),
    [tagOptionsCollection, topologyTags],
  );

  return (
    <div className="topology-container">
      <div className="topology-header">
        <div className="left flex items-center">
          <div className="topology-filter">
            <ContractiveFilter
              delay={1000}
              values={filterTags}
              conditions={conditionsFilter}
              onChange={(e) => {
                setFilterTags(e);
              }}
            />
          </div>
        </div>
        <div className="right">
          <ScaleSelector scale={scale} onChange={(val) => setScale(val)} />
          <TimeSelectWithStore className="ml-3" />
        </div>
      </div>
      <Row className="topology-content">
        <Col span={proportion[0]} className="relative">
          <TopologyChart
            nodeExternalParam={nodeExternalParam}
            isFetching={isFetching}
            data={useData}
            onClickNode={clickNode}
            setScale={setScale}
            scale={scale}
            nodeEle={NodeEle}
            linkTextEle={LinkText}
          />
          <div className="absolute right-4 top-4">
            <Tooltip title={isFolded ? i18n.t('fold') : i18n.t('expand')}>
              <Button size="small" shape="circle" icon={<MenuUnfold />} onClick={() => toggleFold(isFolded)} />
            </Tooltip>
          </div>
        </Col>

        <Col span={proportion[1]}>
          <TopologyDashboard />
        </Col>
      </Row>
      <ServiceMeshDrawer
        type={serviceMeshType}
        visible={serviceMeshVis}
        node={chosenNode}
        onClose={() => toggleDrawer()}
      />
    </div>
  );
};
export default Topology;

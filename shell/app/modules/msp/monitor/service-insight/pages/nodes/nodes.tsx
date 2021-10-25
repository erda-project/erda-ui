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
import { Row, Col } from 'antd';
import NodesMap from './config/chartMap';
import TopTabRight from 'service-insight/common/components/tab-right';
import SICommonStore from '../../stores/common';
import mspStore from 'msp/stores/micro-service';

const PageMap = [
  [NodesMap.heapMemoryUsage, NodesMap.nonHeapMemoryUsage],
  [NodesMap.clusterCount, NodesMap.asyncResources],
];

const Nodes = () => {
  const DICE_CLUSTER_TYPE = mspStore.useStore((s) => s.DICE_CLUSTER_TYPE);
  const isDcos = DICE_CLUSTER_TYPE === 'dcos';
  const type = 'node';
  const [baseInfo, chosenInstance] = SICommonStore.useStore((s) => [s.baseInfo, s.chosenInstance]);
  const { terminusKey, runtimeName, serviceName, applicationId } = baseInfo;
  const curChosen = chosenInstance[type];

  const opt =
    curChosen && terminusKey
      ? {
          query: {
            [`filter_${isDcos ? 'instance_id' : 'service_ip'}`]: curChosen,
            filter_terminus_key: terminusKey,
            filter_application_id: applicationId,
            filter_runtime_name: runtimeName,
            filter_service_name: serviceName,
          },
        }
      : { shouldLoad: false };
  return (
    <div>
      <TopTabRight type={type} />
      {PageMap.map((cols, rIndex) => (
        <Row gutter={20} key={String(rIndex)}>
          {cols.map((Chart, cIndex) => {
            const spanWidth = 24 / cols.length;
            return (
              <Col span={spanWidth} key={String(cIndex)}>
                <Chart {...opt} />
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
};

export default Nodes;

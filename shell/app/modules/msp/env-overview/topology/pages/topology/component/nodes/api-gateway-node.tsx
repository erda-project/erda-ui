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
import CommonNode from 'msp/env-overview/topology/pages/topology/component/nodes/common-node';
import { NodeProps } from 'react-flow-renderer';
import Circular from 'msp/env-overview/topology/pages/topology/component/progress/circular';
import { getFormatter } from 'charts/utils';

const ApiGatewayNode: React.FC<NodeProps<TOPOLOGY.TopoNode>> = (props) => {
  return (
    <CommonNode {...props}>
      {(data: TOPOLOGY.TopoNode['metaData']) => {
        const { error_rate, count } = data.metric;
        return (
          <div className="api-gateway-node service-node">
            <Circular stroke={['#798CF1', '#D84B65']} width={60} strokeWidth={4} percent={error_rate}>
              <div className="h-full flex justify-center items-center">
                <div className="count flex justify-center items-center">
                  <div>{getFormatter('NUMBER').format(count, 1)}</div>
                </div>
              </div>
            </Circular>
            <div className="service-name p-1 text-white absolute overflow-ellipsis overflow-hidden whitespace-nowrap w-28 text-center rounded-sm">
              {data.name}
            </div>
          </div>
        );
      }}
    </CommonNode>
  );
};

export default ApiGatewayNode;

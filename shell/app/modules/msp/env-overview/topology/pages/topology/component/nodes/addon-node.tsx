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
import CommonNode from './common-node';
import Hexagon from '../progress/hexagon';
import ErdaIcon from 'common/components/erda-icon';
import { NodeProps } from 'react-flow-renderer';
import { transformCount } from 'msp/env-overview/topology/pages/topology/utils';
import './index.scss';

const iconMap = {
  Mysql: 'mysql',
  RocketMQ: 'RocketMQ',
  Redis: 'redis',
  default: 'morenzhongjianjian',
};
const AddonNode: React.FC<NodeProps<TOPOLOGY.TopoNode>> = (props) => {
  return (
    <CommonNode {...props}>
      {(data: TOPOLOGY.TopoNode['metaData']) => {
        const { error_rate, count } = data.metric;
        const iconType = iconMap[data.type] ?? iconMap.default;
        return (
          <div className="addon-node">
            <Hexagon stroke={['#798CF1', '#D84B65']} width={60} strokeWidth={2} percent={error_rate}>
              <div className="h-full">
                <div className="text-white mt-4 text-center">{transformCount(count)}</div>
                <div className="mt-1.5 text-center text-darkgray">
                  <ErdaIcon type={iconType} color="currentColor" size={22} />
                </div>
              </div>
            </Hexagon>
          </div>
        );
      }}
    </CommonNode>
  );
};

export default AddonNode;

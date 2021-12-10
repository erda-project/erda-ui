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
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { Popover, Tag } from 'antd';
import i18n from 'i18n';
import './common-node.scss';

export interface IProps extends NodeProps<TOPOLOGY.TopoNode> {
  showRuntime?: boolean;
  className?: string;
  children: (data: IProps['data']['metaData']) => JSX.Element;
  onMouseMoving?: (data: TOPOLOGY.TopoNode, flag: 'in' | 'out') => void;
}

const metric = [
  {
    name: i18n.t('call times'),
    key: 'count',
  },
  {
    name: `${i18n.t('msp:average response time')}(ms)`,
    key: 'rt',
  },
  {
    name: i18n.t('msp:error call times'),
    key: 'http_error',
  },
  {
    name: i18n.t('msp:error rate'),
    key: 'error_rate',
  },
];

const CommonNode = ({ isConnectable, data, children, className, showRuntime, onMouseMoving }: IProps) => {
  const { isRoot, isLeaf, metaData, hoverStatus } = data;
  const popoverContent = (
    <div>
      {showRuntime ? (
        <p className="mb-2">
          <span className="text-white-6 mr-2">Runtime:</span>
          <span className="text-white-9 overflow-ellipsis overflow-hidden whitespace-nowrap">
            {metaData.runtimeName}
          </span>
        </p>
      ) : null}
      <p className="mb-2">
        <span className="text-white-6 mr-2">{i18n.t('type')}:</span>
        <Tag color="#27C99A" className="border-0 bg-green bg-opacity-10">
          {metaData.typeDisplay}
        </Tag>
      </p>
      <div className="metric-detail flex flex-wrap justify-between">
        {metric.map((item) => {
          return (
            <div key={item.key} style={{ width: 140 }} className="mt-2 py-3">
              <p className="text-white text-center leading-8 m-0">{metaData.metric[item.key]}</p>
              <p className="text-white-6 text-center text-xs m-0">{item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleMouseEnter = () => {
    onMouseMoving?.(data, 'in');
  };

  const handleMouseLeave = () => {
    onMouseMoving?.(data, 'out');
  };
  return (
    <>
      {isRoot ? null : (
        <Handle className="node-handle-start" type="target" position={Position.Left} isConnectable={isConnectable} />
      )}
      <div
        className={`${hoverStatus === -1 ? 'opacity-30' : ''} ${className ?? ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Popover
          visible={false}
          placement="right"
          overlayClassName="topology-node-popover"
          title={
            <div className="h-12 py-0 px-4 flex items-center text-white">
              <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{metaData.name}</div>
            </div>
          }
          content={popoverContent}
        >
          {children(metaData)}
        </Popover>
      </div>
      {isLeaf ? null : (
        <Handle className="node-handle-end" type="source" position={Position.Right} isConnectable={isConnectable} />
      )}
    </>
  );
};

export default CommonNode;

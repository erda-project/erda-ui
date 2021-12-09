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
import { goTo } from 'common/utils';
import { find, get, map } from 'lodash';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import mspStore from 'msp/stores/micro-service';

interface IProps extends NodeProps<TOPOLOGY.TopoNode> {
  className?: string;
  children: (data: IProps['data']['metaData']) => JSX.Element;
}

const metric = [
  {
    name: i18n.t('msp:error rate'),
    key: 'error_rate',
  },
  {
    name: i18n.t('msp:error request count'),
    key: 'count',
  },
  {
    name: i18n.t('call times'),
    key: 'count',
  },
  {
    name: `${i18n.t('msp:average response time')}(ms)`,
    key: 'rt',
  },
];

const CommonNode = ({ isConnectable, data, children, className }: IProps) => {
  const params = routeInfoStore.useStore((s) => s.params);
  const [range, rangeData] = monitorCommonStore.useStore((s) => [
    s.globalTimeSelectSpan.range,
    s.globalTimeSelectSpan.data,
  ]);
  const timer = React.useRef(Date.now());
  const [currentProject, mspMenu] = mspStore.useStore((s) => [s.currentProject, s.mspMenu]);
  const { isRoot, isLeaf, metaData } = data;
  const popoverContent = (
    <div>
      <p className="mb-2">
        <span className="text-white-6 mr-2">Runtime:</span>
        <span className="text-white-9 overflow-ellipsis overflow-hidden whitespace-nowrap">{metaData.runtimeName}</span>
      </p>
      <p className="mb-2">
        <span className="text-white-6 mr-2">{i18n.t('type')}:</span>
        <Tag color="#27C99A" className="border-0 bg-green bg-opacity-10">
          {metaData.type}
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
  const handleClick = () => {
    if (Date.now() - timer.current > 300) {
      return;
    }

    const { type, serviceId, applicationId, serviceName, name } = data.metaData;
    const childrenKeyMap = {
      registercenter: ['Services'],
      configcenter: ['Configs'],
    };
    const goToParams = {
      query: {
        mode: rangeData.mode,
        quick: rangeData.mode === 'quick' ? rangeData.quick : undefined,
        start: range.startTimeMs,
        end: range.endTimeMs,
      },
      jumpOut: true,
    };
    switch (type?.toLowerCase()) {
      case 'service':
        goTo(goTo.pages.mspServiceAnalyze, {
          ...params,
          serviceName,
          serviceId: window.encodeURIComponent(serviceId || ''),
          applicationId: currentProject?.type === 'MSP' ? '-' : applicationId,
          ...goToParams,
        });
        break;
      case 'apigateway':
        goTo('./gateway-ingress', goToParams);
        break;
      case 'externalservice':
        goTo(`./ei/${encodeURIComponent(name)}/affairs`, goToParams);
        break;
      case 'registercenter':
      case 'configcenter':
        const subMenuList = get(
          find(mspMenu, ({ key }) => key.toLowerCase() === type),
          'subMenu',
          [],
        );
        let targetPath = '';
        map(childrenKeyMap[type], (item) => {
          if (!targetPath) {
            targetPath = get(find(subMenuList, { key: item }), 'href', '');
          }
        });
        targetPath && goTo(targetPath, goToParams);
    }
  };
  return (
    <>
      {isRoot ? null : (
        <Handle className="node-handle-start" type="target" position={Position.Left} isConnectable={isConnectable} />
      )}
      <div
        className={className ?? ''}
        onMouseDown={() => {
          timer.current = Date.now();
        }}
        onMouseUp={handleClick}
      >
        <Popover
          placement="right"
          overlayClassName="topology-node-popover"
          title={
            <div className="h-12 py-0 px-4 flex items-center text-white">
              <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{metaData.name.repeat(22)}</div>
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

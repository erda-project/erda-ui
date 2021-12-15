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
import i18n from 'i18n';
import { genEdges, genNodes, notAddonTypes, servicesTypes } from 'msp/env-overview/topology/pages/topology/utils';
import ErdaIcon from 'common/components/erda-icon';

export type INodeKey = 'node' | 'service' | 'addon' | 'unhealthyService' | 'freeService' | 'circularDependencies';

interface IProps {
  data: { nodes: TOPOLOGY.INode[] };
  onClick: (data: INodeKey) => void;
}

const genEle = (nodes: TOPOLOGY.INode[]) => {
  const edge = genEdges(nodes);
  const node = genNodes(nodes, edge);
  return { node, edge };
};

const structure: { title: string; content: { key: INodeKey; name: string }[] }[] = [
  {
    title: i18n.t('msp:topology overview'),
    content: [
      {
        name: i18n.t('node'),
        key: 'node',
      },
      {
        name: i18n.t('service'),
        key: 'service',
      },
      {
        name: i18n.t('common:middleware'),
        key: 'addon',
      },
    ],
  },
  {
    title: i18n.t('msp:topology analysis'),
    content: [
      {
        name: i18n.t('msp:unhealthy service'),
        key: 'unhealthyService',
      },
      {
        name: i18n.t('msp:free service'),
        key: 'freeService',
      },
      {
        name: i18n.t('msp:circular dependency'),
        key: 'circularDependencies',
      },
    ],
  },
];

const TopologyOverview: React.FC<IProps> = ({ data, onClick }) => {
  const [expand, setExpand] = React.useState(true);
  const values = React.useMemo<{ [key in INodeKey]: number }>(() => {
    const temp = {
      node: 0,
      addon: 0,
      service: 0,
      freeService: 0,
      unhealthyService: 0,
      circularDependencies: 0,
    };
    if (data.nodes) {
      const { node } = genEle(data.nodes);
      temp.node = node.length;
      node.forEach((item) => {
        if (item.data?.metaData) {
          const { parentCount, childrenCount, metaData, isCircular } = item.data;
          const { metric, type } = metaData;
          if (metric.error_rate > 0) {
            temp.unhealthyService = temp.unhealthyService + 1;
          }
          if (servicesTypes.includes(type.toLocaleLowerCase())) {
            temp.service = temp.service + 1;
          }
          if (!notAddonTypes.includes(type.toLocaleLowerCase())) {
            temp.addon = temp.addon + 1;
          }
          if (parentCount === 0 && childrenCount === 0) {
            temp.freeService = temp.freeService + 1;
          }
          if (isCircular) {
            temp.circularDependencies = temp.circularDependencies + 1;
          }
        }
      });
    }
    return temp;
  }, [data.nodes]);
  const [selectKey, setSelectKey] = React.useState<INodeKey>('node');
  return (
    <div className={`topology-overview relative ${expand ? 'expand' : 'collapse'}`}>
      <div
        className="absolute h-8 w-5 bg-white-1 top-1/2 -right-5 z-10 cursor-pointer flex justify-center items-center text-white-4 hover:text-white"
        onClick={() => {
          setExpand((prevState) => !prevState);
        }}
      >
        <ErdaIcon type={expand ? 'zuofan' : 'youfan'} />
      </div>
      <div className="content w-full">
        {structure.map((item) => {
          return (
            <div className="w-full mb-4 last:mb-0">
              <div className="leading-8 text-white px-4 py-2 w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
                {item.title}
              </div>
              <div className="flex justify-center items-center rounded-sm">
                {item.content.map((v) => {
                  return (
                    <div
                      key={v.key}
                      className={`cursor-pointer flex-shrink-0 m-1 text-center card-item py-3 border border-solid ${
                        v.key === selectKey ? 'border-purple-deep' : 'border-transparent'
                      } hover:border-purple-deep`}
                      onClick={() => {
                        setSelectKey(v.key);
                        onClick(v.key);
                      }}
                    >
                      <p className="text-white text-xl m-0 py-0.5">{values[v.key] ?? 0}</p>
                      <p className="text-white-6 text-xs m-0 py-0.5">{v.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopologyOverview;

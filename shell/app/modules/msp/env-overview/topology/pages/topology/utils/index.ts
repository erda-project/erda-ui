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
import { ArrowHeadType, Edge, Node } from 'react-flow-renderer';
import { cloneDeep, omit, uniqBy } from 'lodash';

const getNodeType = (type: string) => {
  const nodeType = type.toLocaleLowerCase();

  if (!['service', 'apigateway', 'externalservice'].includes(nodeType)) {
    return 'addon';
  }
  return nodeType;
};

export const genNodes = (list: TOPOLOGY.INode[], edges: Edge[]): Node<TOPOLOGY.TopoNode>[] => {
  const nodes: Node<TOPOLOGY.TopoNode>[] = [];
  cloneDeep(list).forEach((item) => {
    const { parents = [], ...rest } = item;
    const childrenCount = edges.filter((t) => t.source === rest.id).length;
    const parentCount = edges.filter((t) => t.target === rest.id).length;
    const isLeaf = !childrenCount;
    nodes.push({
      id: rest.id,
      type: getNodeType(rest.type),
      data: {
        isRoot: !parentCount,
        isParent: !isLeaf,
        isLeaf,
        childrenCount,
        parentCount,
        label: rest.name,
        metaData: rest,
      },
      position: {
        x: 0,
        y: 0,
      },
    });
  });
  return uniqBy(nodes, 'id');
};

export const genEdges = (data: TOPOLOGY.INode[]): Edge<TOPOLOGY.TopoEdge>[] => {
  const convert = (list: TOPOLOGY.INode[], edges: Edge<TOPOLOGY.TopoEdge>[]) => {
    cloneDeep(list).forEach((item) => {
      const { parents = [], ...rest } = item;
      if (parents.length) {
        parents.forEach((parent: TOPOLOGY.INode) => {
          edges.push({
            id: `${parent.id}-${rest.id}`,
            source: parent.id,
            target: rest.id,
            type: 'float',
            arrowHeadType: ArrowHeadType.ArrowClosed,
            data: {
              source: omit(parent, 'parents'),
              target: rest,
            },
          });
        });
      }
    });
    return edges;
  };
  return convert(data, []);
};

export const transformCount = (num: number) => {
  if (num > 1000) {
    const count = (num / 1000).toFixed(1);
    return `${count} K`;
  }
  return num;
};

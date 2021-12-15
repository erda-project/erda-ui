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
import ReactFlow, {
  Elements,
  isNode,
  Node,
  Position,
  ReactFlowProvider,
  removeElements,
  useZoomPanHelper,
} from 'react-flow-renderer';
import dagre from 'dagrejs';
import { genEdges, genNodes } from 'msp/env-overview/topology/pages/topology/utils';
import customerNode from './nodes';
import FloatingEdge from 'msp/env-overview/topology/pages/topology/component/floating-edge';
import FloatingConnectionLine from 'msp/env-overview/topology/pages/topology/component/floating-edge/connection-line';
import ErdaIcon from 'common/components/erda-icon';
import { useUpdateEffect } from 'react-use';
import { INodeKey } from './topology-overview';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeExtent = [
  [0, 0],
  [1000, 1000],
];

interface IProps {
  filterKey: INodeKey;
  data: { nodes: TOPOLOGY.INode[] };
  clockNode: (data: TOPOLOGY.TopoNode['metaData']) => void;
}

const genEle = (nodes: TOPOLOGY.INode[], filterKey: INodeKey) => {
  let edge = genEdges(nodes);
  let node = genNodes(nodes, edge);
  switch (filterKey) {
    case 'unhealthyService':
      edge = edge.filter((t) => t.data?.isUnhealthy);
      node = node.filter((t) => t.data?.isUnhealthy);
      break;
    case 'addon':
      edge = edge.filter((t) => t.data?.isAddon);
      node = node.filter((t) => t.data?.isAddon);
      break;
    case 'service':
      edge = edge.filter((t) => t.data?.isService);
      node = node.filter((t) => t.data?.isService);
      break;
    case 'circularDependencies':
      edge = edge.filter((t) => t.data?.isCircular);
      node = node.filter((t) => t.data?.isCircular);
      break;
    case 'freeService':
      edge = [];
      node = node.filter((t) => t.data?.parentCount === 0 && t.data?.childrenCount === 0);
      break;
  }
  return { node, edge };
};

/**
 * @description calculate node position
 * @see https://github.com/dagrejs/dagre/wiki
 */
const calculateLayout = (
  list: Elements,
): [Elements, { width: number; height: number; maxY: number; maxX: number; minX: number; minY: number }] => {
  let width = 0;
  let height = 0;
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  dagreGraph.setGraph({ rankdir: 'LR' });
  list.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 150, height: 80 });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });
  dagre.layout(dagreGraph, { weight: 2 });
  const layoutedElements = list.map((el) => {
    const temp: Partial<Node> = {};
    if (isNode(el)) {
      // get node coordinates
      const nodeWithPosition = dagreGraph.node(el.id);
      temp.targetPosition = Position.Left;
      temp.sourcePosition = Position.Right;
      const x = (nodeWithPosition.x + Math.random() / 1000) * 0.75;
      const y = nodeWithPosition.y;
      width = width < x ? x : width;
      height = height < y ? y : height;
      minX = minX < x ? minX : x;
      minY = minY < y ? minY : y;
      temp.position = { x, y };
    }
    return { ...el, ...temp };
  });
  console.log({ width, height, maxY: height, maxX: width, minX, minY });
  return [layoutedElements, { width, height, maxY: height, maxX: width, minX, minY }];
};

const TopologyComp = ({ data, filterKey = 'node', clockNode }: IProps) => {
  const topologyData = React.useRef(genEle(data.nodes, filterKey));
  const layoutData = React.useRef<Elements>([]);
  const wrapperRaf = React.useRef<HTMLDivElement>();
  const { node, edge } = topologyData.current;
  const initElement: Elements = [...node, ...edge];
  const [elements, setElements] = React.useState<Elements>(initElement);
  const { zoomIn, zoomOut } = useZoomPanHelper();
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));

  const setFlowConfig = (list: Elements) => {
    const [ele, wrapperSize] = calculateLayout(list);
    if (wrapperRaf.current) {
      // 200: prevents nodes from being covered by borders
      wrapperRaf.current.style.height = `${wrapperSize.height + 200}px`;
      wrapperRaf.current.style.width = `${wrapperSize.width + 200}px`;
      // the node positions calculated by the current layout algorithm may be out of view and adjusted manually
      // 50 : prevents nodes from hugging the border
      wrapperRaf.current.parentElement?.scrollTo({
        top: wrapperSize.minY - 50,
        left: wrapperSize.minX - 50,
        behavior: 'smooth',
      });
    }
    layoutData.current = ele;
    setElements(layoutData.current);
  };

  useUpdateEffect(() => {
    const temp = genEle(data.nodes, filterKey);
    topologyData.current = temp;
    setFlowConfig([...temp.node, ...temp.edge]);
  }, [data.nodes, filterKey]);

  const layout = () => {
    setFlowConfig(elements);
  };

  const nodeTypes = customerNode((currentNode, flag) => {
    const { id } = currentNode.metaData;
    const originData = topologyData.current;
    const prevNodeIds = originData.edge.filter((t) => t.target === id).map((t) => t.source);
    const nextNodeIds = originData.edge.filter((t) => t.source === id).map((t) => t.target);
    let newLayoutData = layoutData.current;
    if (flag === 'in') {
      newLayoutData = layoutData.current.map((item) => {
        if (isNode(item)) {
          return {
            ...item,
            data: {
              ...item.data,
              hoverStatus: [...prevNodeIds, ...nextNodeIds, id].includes(item.id) ? 1 : -1,
            },
          };
        } else {
          return {
            ...item,
            data: {
              ...item.data,
              hoverStatus: item.id.includes(id) ? 1 : -1,
            },
          };
        }
      });
    }
    setElements(newLayoutData);
  }, clockNode);

  return (
    <div className="min-h-full min-w-full" ref={wrapperRaf}>
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onElementsRemove={onElementsRemove}
        edgeTypes={{
          float: FloatingEdge,
        }}
        preventScrolling={false}
        zoomOnScroll={false}
        connectionLineComponent={FloatingConnectionLine}
        nodeExtent={nodeExtent}
        defaultZoom={0.8}
        minZoom={0.2}
        maxZoom={2}
        onLoad={layout}
      >
        <div className="zoom-buttons fixed bottom-6 right-4 h-8 w-20 flex z-10">
          <div
            className="cursor-pointer w-9 flex justify-center items-center mr-0.5"
            onClick={() => {
              zoomOut();
            }}
          >
            <ErdaIcon type="minus" size={12} />
          </div>
          <div
            className="cursor-pointer w-9 flex justify-center items-center"
            onClick={() => {
              zoomIn();
            }}
          >
            <ErdaIcon type="plus" size={12} />
          </div>
        </div>
      </ReactFlow>
    </div>
  );
};
export default (props: IProps) => {
  return (
    <ReactFlowProvider>
      <TopologyComp {...props} />
    </ReactFlowProvider>
  );
};

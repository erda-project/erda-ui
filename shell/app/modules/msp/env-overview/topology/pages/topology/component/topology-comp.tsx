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
import ApiGatewayNode from './nodes/api-gateway-node';
import ServicesNode from './nodes/services-node';
import ExternalServiceNode from './nodes/external-service-node';
import AddonNode from './nodes/addon-node';
import FloatingEdge from 'msp/env-overview/topology/pages/topology/component/floating-edge';
import FloatingConnectionLine from 'msp/env-overview/topology/pages/topology/component/floating-edge/connection-line';
import ErdaIcon from 'common/components/erda-icon';
import { useUpdateEffect } from 'react-use';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeExtent = [
  [0, 0],
  [1000, 1000],
];

interface IProps {
  data: { nodes: TOPOLOGY.INode[] };
}

const genEle = (nodes: TOPOLOGY.INode[]): Elements => {
  const edge = genEdges(nodes);
  const node = genNodes(nodes, edge);
  return [...node, ...edge];
};

/**
 * @description calculate node position
 * @see https://github.com/dagrejs/dagre/wiki
 */
const calculateLayout = (list: Elements) => {
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
      temp.position = { x: (nodeWithPosition.x + Math.random() / 1000) * 0.75, y: nodeWithPosition.y };
    }
    return { ...el, ...temp };
  });
  return layoutedElements;
};

const TopologyComp = ({ data }: IProps) => {
  const initElement: Elements = genEle(data.nodes);
  const [elements, setElements] = React.useState<Elements>(initElement);
  const { zoomIn, zoomOut } = useZoomPanHelper();
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));

  useUpdateEffect(() => {
    setElements(calculateLayout(genEle(data.nodes)));
  }, [data.nodes]);

  const layout = () => {
    setElements(calculateLayout(elements));
  };

  return (
    <ReactFlow
      className="relative"
      elements={elements}
      nodeTypes={{
        apigateway: ApiGatewayNode,
        service: ServicesNode,
        externalservice: ExternalServiceNode,
        addon: AddonNode,
      }}
      onElementsRemove={onElementsRemove}
      edgeTypes={{
        float: FloatingEdge,
      }}
      connectionLineComponent={FloatingConnectionLine}
      nodeExtent={nodeExtent}
      minZoom={0.2}
      maxZoom={2}
      onLoad={layout}
    >
      <div className="zoom-buttons absolute bottom-4 right-4 h-8 w-20 flex z-10">
        <div className="cursor-pointer w-9 flex justify-center items-center mr-0.5">
          <ErdaIcon
            type="minus"
            size={12}
            onClick={() => {
              zoomOut();
            }}
          />
        </div>
        <div className="cursor-pointer w-9 flex justify-center items-center">
          <ErdaIcon
            type="plus"
            size={12}
            onClick={() => {
              zoomIn();
            }}
          />
        </div>
      </div>
    </ReactFlow>
  );
};
export default (props: IProps) => {
  return (
    <ReactFlowProvider>
      <TopologyComp {...props} />
    </ReactFlowProvider>
  );
};

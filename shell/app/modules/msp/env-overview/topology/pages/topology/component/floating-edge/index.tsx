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

import React, { CSSProperties, FC, useMemo } from 'react';
import { EdgeProps, getBezierPath, getMarkerEnd, useStoreState } from 'react-flow-renderer';

import { getEdgeParams } from './utils';

const FloatingEdge: FC<EdgeProps> = ({ id, source, target, arrowHeadType, markerEndId, style }) => {
  const nodes = useStoreState((state) => state.nodes);
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const sourceNode = useMemo(() => nodes.find((n) => n.id === source), [source, nodes]);
  const targetNode = useMemo(() => nodes.find((n) => n.id === target), [target, nodes]);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <g className="react-flow__connection">
      <path id={id} className="react-flow__edge-path" d={d} markerEnd={markerEnd} style={style as CSSProperties} />
    </g>
  );
};
export default FloatingEdge;

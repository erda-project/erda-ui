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
import { uuid } from 'common/utils';
import themeColor from 'app/theme-color.mjs';

// draw line
const Line = ({ index, data, lineWidth }: { index: number; data: DEVOPS_WORKFLOW.BranchPolicy; lineWidth: number }) => {
  const baseConfig = {
    width: lineWidth,
    top: 30,
    height: 30,
    distance: 5,
    margin: 8,
    markedWidth: 7,
  };
  const { width, top, height, distance, margin, markedWidth } = baseConfig;
  const getLinePostion = () => {
    if (index === 1) {
      const pos = { x1: distance, y1: height / 2 + top, x2: width - distance - markedWidth, y2: height / 2 + top };
      const _id = uuid();
      return (
        <svg key={'line1'} width={width} height={top + height}>
          <defs>
            <marker id={`markerEnd${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
          </defs>
          <line
            {...pos}
            style={{ stroke: themeColor['light-gray'], strokeWidth: '1px', markerEnd: `url(#markerEnd${_id})` }}
          />
          <foreignObject width={70} height={18} x={(pos.x2 + pos.x1) / 2 - 35} y={pos.y1 - 18}>
            <div className="text-xs text-default-6 text-center">{'pull'}</div>
          </foreignObject>
        </svg>
      );
    } else {
      const { cherryPick } = data.policy?.targetBranch || {};
      const pickLen = cherryPick !== undefined ? cherryPick.split(',').length : 0;
      const pos = { x1: distance, y1: height / 2 + top, x2: width - distance - markedWidth, y2: height / 2 + top };
      const _id = uuid();
      return (
        <svg key={'line2'} width={width} height={top + height + pickLen * (height + margin)}>
          <defs>
            <marker id={`markerEnd1_${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
            <marker id={`markerEnd2_${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
          </defs>
          <g>
            <line
              {...pos}
              style={{ stroke: themeColor['light-gray'], strokeWidth: '1px', markerEnd: `url(#markerEnd1_${_id})` }}
            />
            <foreignObject width={70} height={18} x={(pos.x2 + pos.x1) / 2 - 35} y={pos.y1 - 18}>
              <div className="text-xs text-default-6 text-center">{'merge'}</div>
            </foreignObject>
          </g>
          {new Array(pickLen).fill('').map((_, idx) => {
            const { path, textPos } = getCPath(
              distance,
              height / 2 + top,
              width - distance - markedWidth,
              height / 2 + top + (idx + 1) * (height + margin),
            );
            return (
              <g key={idx}>
                <path
                  stroke={themeColor['light-gray']}
                  fill="transparent"
                  d={path}
                  style={{ markerEnd: `url(#markerEnd2_${_id})` }}
                />

                <foreignObject width={70} height={18} x={textPos.x - 35} y={textPos.y - 9}>
                  <div className="text-xs text-default-6 text-center">{'pick'}</div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      );
    }
  };
  const lines = <div className="relative">{getLinePostion()}</div>;

  return <div style={{ width: lineWidth }}>{lines}</div>;
};

// berzier path count
const getCPath = (x1: number, y1: number, x2: number, y2: number) => {
  let path = `M${x1} ${y1} `;
  const c = `C ${x1} ${y1}, ${qBerzier([x1, y1], [(x1 + x2) / 2, y1], [(x2 + x1) / 2, (y2 + y1) / 2], 0.3)},${
    (x2 + x1) / 2
  } ${(y2 + y1) / 2}C${(x2 + x1) / 2} ${(y2 + y1) / 2},${qBerzier(
    [(x2 + x1) / 2, (y2 + y1) / 2],
    [(x1 + x2) / 2, y2],
    [x2, y2],
    0.7,
  )},${x2} ${y2}`;

  return { path: `${path}${c}`, textPos: { x: (x2 + x1) / 2, y: y2 === y1 ? y1 : (y2 + y1) / 2 } };
};

// bersier formula
const qBerzier = (p0: number[], p1: number[], p2: number[], t: number) => {
  const x = (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0];
  const y = (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1];
  return `${x} ${y}`;
};

export default Line;

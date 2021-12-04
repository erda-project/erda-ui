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
import { getProgressPoint } from '../../../helpers/bar-helper';
import { BarDisplay } from './bar-display';
import { BarDateHandle } from './bar-date-handle';
import { ErdaIcon } from 'common';
import { BarProgressHandle } from './bar-progress-handle';
import { TaskItemProps } from '../task-item';
import './bar.scss';

export const Bar: React.FC<TaskItemProps> = ({
  task,
  isProgressChangeable,
  isDateChangeable,
  rtl,
  onEventStart,
  isSelected,
}) => {
  const progressPoint = getProgressPoint(+!rtl * task.progressWidth + task.progressX, task.y, task.height);
  const handleHeight = task.height - 2;
  const taskWidth = task.x2 - task.x1;
  return (
    <g className={'erda-gantt-bar-wrapper'} tabIndex={0}>
      {/* <BarDisplay
        x={task.x1}
        y={task.y}
        width={taskWidth}
        height={task.height}
        progressX={task.progressX}
        progressWidth={task.progressWidth}
        barCornerRadius={task.barCornerRadius}
        styles={task.styles}
        isSelected={isSelected}
        onMouseDown={(e) => {
          isDateChangeable && onEventStart('move', task, e);
        }}
      /> */}
      {isDateChangeable && (
        <foreignObject
          transform={`translate(${task.x1 - 14},${task.y})`}
          style={{ willChange: 'transform' }}
          // x={task.x1 - 14}
          onMouseDown={(e) => {
            isDateChangeable && onEventStart('move', task, e);
          }}
          // y={task.y}
          width={taskWidth / 2 + 14}
          height={handleHeight}
        >
          <div
            className="erda-gantt-bar-background"
            onMouseDown={(e) => {
              isDateChangeable && onEventStart('move', task, e);
            }}
          >
            <span
              className="erda-gantt-bar-handle left-handle"
              onMouseDown={(e) => {
                onEventStart('start', task, e);
              }}
            >
              <ErdaIcon className="erda-gantt-bar-handle-icon" type={'left'} />
            </span>
            <span
              className="erda-gantt-bar-handle right-handle"
              onMouseDown={(e) => {
                onEventStart('end', task, e);
              }}
            >
              <ErdaIcon className="erda-gantt-bar-handle-icon" type={'right'} />
            </span>
          </div>
        </foreignObject>
      )}
      {isProgressChangeable && (
        <BarProgressHandle
          progressPoint={progressPoint}
          onMouseDown={(e) => {
            onEventStart('progress', task, e);
          }}
        />
      )}
    </g>
  );
};

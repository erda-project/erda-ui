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
  const handleHeight = task.height;
  const taskWidth = task.x2 - task.x1;

  const getBarColor = () => {
    return isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  };
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
          onMouseDown={(e) => {
            isDateChangeable && onEventStart('move', task, e);
          }}
          width={taskWidth + 28}
          height={handleHeight}
        >
          <div
            className="erda-gantt-bar-container relative"
            onMouseDown={(e) => {
              isDateChangeable && onEventStart('move', task, e);
            }}
          >
            <div
              className="erda-gantt-bar-background absolute rounded"
              style={{ backgroundColor: getBarColor(), width: taskWidth, height: handleHeight, left: 14, top: 0 }}
            />
            <div
              className="erda-gantt-bar-handle-box absolute"
              style={{
                width: taskWidth / 2 + 14,
                height: handleHeight,
              }}
            >
              <span
                className="erda-gantt-bar-handle left-handle"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onEventStart('start', task, e);
                }}
              >
                <ErdaIcon className="erda-gantt-bar-handle-icon" type={'left'} />
              </span>
            </div>
            <div
              className="erda-gantt-bar-handle-box absolute text-right"
              style={{
                width: taskWidth / 2 + 14,
                height: handleHeight,
                left: 14 + taskWidth / 2,
                top: 0,
              }}
            >
              <span
                className="erda-gantt-bar-handle right-handle"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onEventStart('end', task, e);
                }}
              >
                <ErdaIcon className="erda-gantt-bar-handle-icon" type={'right'} />
              </span>
            </div>
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

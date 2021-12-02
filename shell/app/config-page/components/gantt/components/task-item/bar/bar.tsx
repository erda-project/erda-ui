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
      <BarDisplay
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
      />
      <g className="handleGroup">
        {isDateChangeable && (
          <g>
            {/* left */}
            <foreignObject
              className="erda-gantt-bar-icon-wrapper"
              x={task.x1 - 14}
              onMouseDown={(e) => {
                isDateChangeable && onEventStart('move', task, e);
              }}
              y={task.y}
              width={taskWidth / 2 + 14}
              height={handleHeight}
            >
              <ErdaIcon className="erda-gantt-bar-handle-icon" type={'left'} />
            </foreignObject>
            <foreignObject
              className="erda-gantt-bar-icon-wrapper right"
              x={task.x2 - taskWidth / 2}
              y={task.y}
              width={taskWidth / 2 + 14}
              onMouseDown={(e) => {
                isDateChangeable && onEventStart('move', task, e);
              }}
              height={handleHeight}
            >
              <ErdaIcon className="erda-gantt-bar-handle-icon" type={'right'} />
            </foreignObject>
            <BarDateHandle
              x={task.x1 - task.handleWidth}
              y={task.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={(e) => {
                onEventStart('start', task, e);
              }}
            />
            {/* right */}
            <BarDateHandle
              x={task.x2 - task.handleWidth}
              y={task.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={(e) => {
                onEventStart('end', task, e);
              }}
            />
          </g>
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
    </g>
  );
};

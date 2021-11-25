import React from 'react';
import { TaskItemProps } from '../task-item';
import './project.scss';

const barHeight = 4;
export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const barColor = '#798CF1'; // isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  const processColor = isSelected ? task.styles.progressSelectedColor : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;

  const projectLeftTriangle = [
    task.x1,
    task.y + barHeight - 1,
    task.x1,
    task.y + barHeight * 2,
    task.x1 + 8,
    task.y + barHeight - 1,
  ].join(',');
  const projectRightTriangle = [
    task.x2,
    task.y + barHeight - 1,
    task.x2,
    task.y + barHeight * 2,
    task.x2 - 8,
    task.y + barHeight - 1,
  ].join(',');
  return (
    <g tabIndex={0} className={'erda-gantt-project-wrapper'}>
      {/* <rect
        fill={barColor}
        x={task.x1}
        width={projectWith}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={'erda-gantt-project-background'}
      /> */}
      <rect
        x={task.progressX}
        width={task.progressWidth}
        y={task.y}
        height={task.height}
        ry={task.barCornerRadius}
        rx={task.barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        x={task.x1}
        width={projectWith}
        y={task.y}
        height={barHeight}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={'erda-gantt-project-top'}
      />
      <polygon className={'erda-gantt-project-top'} points={projectLeftTriangle} fill={barColor} />
      <polygon className={'erda-gantt-project-top'} points={projectRightTriangle} fill={barColor} />
    </g>
  );
};

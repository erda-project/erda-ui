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
import { TaskItemProps } from '../task-item';
import './project.scss';

const barHeight = 4;
export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const barColor = isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  const processColor = isSelected ? task.styles.progressSelectedColor : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;

  const projectLeftTriangle = [0, barHeight - 1, 0, barHeight * 2, 0 + 8, barHeight - 1].join(',');
  const projectRightTriangle = [
    projectWith,
    barHeight - 1,
    projectWith,
    barHeight * 2,
    projectWith - 8,
    barHeight - 1,
  ].join(',');
  return (
    <g tabIndex={0} className={'erda-gantt-project-wrapper'} transform={`translate(${task.x1}, ${task.y})`}>
      <rect
        fill={'transparent'}
        // x={task.x1}
        width={projectWith}
        // y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={'erda-gantt-project-background'}
      />
      <rect
        // x={task.progressX}
        width={task.progressWidth}
        transform={`translate(${task.progressX},${task.y})`}
        // y={task.y}
        height={task.height}
        ry={task.barCornerRadius}
        rx={task.barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        // x={task.x1}
        width={projectWith}
        // y={task.y}
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

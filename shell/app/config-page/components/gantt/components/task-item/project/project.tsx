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

export const Project: React.FC<TaskItemProps> = ({ task, BarContentRender }) => {
  return (
    <g tabIndex={0} className={'erda-gantt-project-wrapper'}>
      <foreignObject className="overflow-visible" width={task.x2 - task.x1} height={task.height} x={task.x1} y={task.y}>
        <div
          className="relative erda-gantt-project-background text-default-8"
          style={{
            left: 0,
            top: 0,
            width: task.x2 - task.x1,
            height: task.height,
            backgroundColor: task.styles.backgroundColor,
          }}
        >
          {BarContentRender}
        </div>
      </foreignObject>
    </g>
  );
};

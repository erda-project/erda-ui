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

import React, { useEffect, useState } from 'react';
import { BarTask } from '../../types/bar-task';
import { GanttContentMoveAction } from '../../types/gantt-task-actions';
import { Bar } from './bar/bar';
import { BarSmall } from './bar/bar-small';
import { Milestone } from './milestone/milestone';
import { Project } from './project/project';
import './task-list.scss';

export type TaskItemProps = {
  task: BarTask;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  ganttEvent: Obj;
  isMoving: boolean;
  BarContentRender?: React.ReactNode;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent,
  ) => any;
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const { task, isSelected, onEventStart, BarContentRender } = {
    ...props,
  };
  const [taskItem, setTaskItem] = useState<JSX.Element | null>(null);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    switch (task.typeInternal) {
      case 'milestone':
        setTaskItem(<Milestone {...props} />);
        break;
      case 'project':
        setTaskItem(<Project {...props} />);
        break;
      case 'smalltask':
        setTaskItem(<BarSmall {...props} />);
        break;
      default:
        setTaskItem(<Bar {...props} />);
        break;
    }
  }, [task, isSelected]);

  if (task.start && task.end) {
    return (
      <g
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onMouseEnter={(e) => {
          onEventStart('mouseenter', task, e);
          setIsHover(true);
        }}
        onMouseLeave={(e) => {
          onEventStart('mouseleave', task, e);
          setIsHover(false);
        }}
        onDoubleClick={(e) => {
          onEventStart('dblclick', task, e);
        }}
        onFocus={() => {
          onEventStart('select', task);
        }}
      >
        {taskItem &&
          React.cloneElement(taskItem, {
            BarContentRender: BarContentRender ? (
              <BarContentRender task={task} isHover={isHover} />
            ) : (
              <div>{task.name}</div>
            ),
          })}
      </g>
    );
  } else {
    return null;
  }
};

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

import React, { useEffect, useRef, useState } from 'react';
import { BarTask } from '../../types/bar-task';
import { GanttContentMoveAction } from '../../types/gantt-task-actions';
import { Bar } from './bar/bar';
import { BarSmall } from './bar/bar-small';
import { useUpdateEffect } from 'react-use';
import { Milestone } from './milestone/milestone';
import moment from 'moment';
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
  BarContentRender?: React.ReactNode;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent,
  ) => any;
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const { task, arrowIndent, isDelete, taskHeight, isSelected, rtl, onEventStart, BarContentRender, ganttEvent } = {
    ...props,
  };
  const textRef = useRef<SVGTextElement>(null);
  const [taskItem, setTaskItem] = useState<JSX.Element>(<div />);
  const [isTextInside, setIsTextInside] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const [curPos, setCurPos] = useState({
    x2: task.x2,
    x1: task.x1,
    height: task.height,
    y: task.y,
    start: task.start,
    end: task.end,
  });

  const { changedTask } = ganttEvent || {};
  useUpdateEffect(() => {
    if (!changedTask) {
      setCurPos({
        x2: task.x2,
        x1: task.x1,
        height: task.height,
        y: task.y,
        start: task.start,
        end: task.end,
      });
    }
  }, [changedTask, task]);

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

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return task.x1 - textRef.current.getBBox().width - arrowIndent * +hasChild - arrowIndent * 0.2;
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  return (
    <>
      {task.type !== 'project' ? (
        <g>
          <foreignObject
            x={curPos.x1 + 4}
            y={curPos.y - 2}
            width={curPos.x2 - curPos.x1 - 8}
            height={curPos.height + 4}
          >
            <div
              className={`text-sm text-desc erda-gantt-task-preview-box bg-white bg-opacity-100 w-full h-full ${
                changedTask ? 'visible' : 'invisible'
              }`}
            >
              {moment(curPos.start).format('YYYY-MM-DD')}~{moment(curPos.end).format('YYYY-MM-DD')}
            </div>
          </foreignObject>
        </g>
      ) : null}
      <g
        onKeyDown={(e) => {
          switch (e.key) {
            case 'Delete': {
              if (isDelete) onEventStart('delete', task, e);
              break;
            }
          }
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
        {taskItem}
        {BarContentRender ? (
          <foreignObject
            id={`task-render-${task.id}`}
            className="erda-gantt-task-foreign-render"
            onFocus={() => {
              onEventStart('select', task);
            }}
            x={task.x1 + 4}
            y={task.y}
            width={task.x2 - task.x1 - 8}
            height={task.height}
          >
            <BarContentRender task={task} isHover={isHover} />
          </foreignObject>
        ) : (
          <text
            x={getX()}
            y={task.y + taskHeight * 0.5}
            className={
              isTextInside ? 'erda-gantt-task-bar-label' : 'erda-gantt-task-bar-label erda-gantt-task-bar-label-outside'
            }
            ref={textRef}
          >
            {task.name}
          </text>
        )}
      </g>
    </>
  );
};

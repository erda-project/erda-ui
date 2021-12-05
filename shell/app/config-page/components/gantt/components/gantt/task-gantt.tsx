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

import React, { useRef, useEffect } from 'react';
import { GridProps, Grid } from '../grid/grid';
import { CalendarProps, Calendar } from '../calendar/calendar';
import { TaskGanttContentProps, TaskGanttContent } from './task-gantt-content';
import './gantt.scss';

export interface TaskGanttProps {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  BarContentRender: React.ReactNode;
}
export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  BarContentRender,
}) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const newBarProps = { ...barProps, svg: ganttSVGRef };

  return (
    <div className={'erda-gantt-vertical-container'} dir="ltr">
      <Calendar {...calendarProps} />
      <div
        className={'erda-gantt-horizontal-container'}
        style={ganttHeight ? { height: ganttHeight, width: gridProps.svgWidth } : { width: gridProps.svgWidth }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={barProps.rowHeight * barProps.tasks.length}
          fontFamily={barProps.fontFamily}
          style={{ overflow: 'visible' }}
          ref={ganttSVGRef}
        >
          <Grid {...gridProps} />
          <TaskGanttContent {...newBarProps} BarContentRender={BarContentRender} />
        </svg>
      </div>
    </div>
  );
};

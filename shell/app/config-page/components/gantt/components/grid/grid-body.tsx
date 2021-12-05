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

import React, { ReactChild } from 'react';
import { Task } from '../../types/public-types';
import { max, min } from 'lodash';
import moment from 'moment';
import './grid.scss';

export interface GridBodyProps {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
  ganttEvent: Obj;
}

const getDateFormX = (x1 = -1, x2 = -1, dateDelta: number, columnWidth: number, firstDate: number) => {
  if (x1 === -1 || x2 === -1) return [];
  const unit = dateDelta / columnWidth;
  const start = x1 * unit + firstDate;
  const end = x2 * unit + firstDate;
  return [start, end].sort();
};

export const GridBody: React.FC<GridBodyProps> = ({
  tasks: originTasks,
  dates,
  barTasks: tasks,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  selectedTask,
  ganttHeight,
  setSelectedTask,
  rtl,
  onDateChange,
  ganttEvent,
  setRangeAddTime,
}) => {
  let y = 0;
  const gridRows: ReactChild[] = [];
  const dateDelta =
    dates[1].getTime() -
    dates[0].getTime() -
    dates[1].getTimezoneOffset() * 60 * 1000 +
    dates[0].getTimezoneOffset() * 60 * 1000;

  const [startPos, setStartPos] = React.useState<null | number[]>(null);
  const [endPos, setEndPos] = React.useState<null | number[]>(null);
  const [chosenTask, setChosenTask] = React.useState<Obj | null>(null);

  React.useEffect(() => {
    if (startPos && endPos) {
      setRangeAddTime({ x1: startPos[0], x2: endPos[0] });
    } else {
      setRangeAddTime(null);
    }
  }, [startPos, endPos]);
  const onMouseDown = (e: React.MouseEvent) => {
    const gridPos = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - gridPos.y;
    const clickPos = Math.floor(clickY / rowHeight);
    const curTask = tasks[clickPos];

    if (!curTask.start || !curTask.end) {
      setSelectedTask(curTask.id);
      setChosenTask(curTask);
      setStartPos([e.clientX - gridPos.x, clickPos * rowHeight + 8]);
    }
  };
  const mouseUnFocus = () => {
    setStartPos(null);
    setEndPos(null);
    setChosenTask(null);
  };

  const addTime = getDateFormX(startPos?.[0], endPos?.[0], dateDelta, columnWidth, dates[0].getTime());

  const onMouseUp = () => {
    if (addTime.length && addTime[1] - addTime[0] >= dateDelta * 0.6 && chosenTask) {
      onDateChange({ ...chosenTask, start: new Date(addTime[0]), end: new Date(addTime[1]) });
    }
    mouseUnFocus();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const gridPos = e.currentTarget.getBoundingClientRect();
    if (startPos) {
      setEndPos([e.clientX - gridPos.x, startPos[1] + rowHeight - 16]);
    }
  };

  for (const task of tasks) {
    const validTask = task.start && task.end;
    gridRows.push(
      <rect
        key={'Row' + task.id}
        x="0"
        y={y}
        onClick={() => {
          if (validTask) {
            setSelectedTask(task.id);
          }
        }}
        width={svgWidth}
        height={rowHeight}
        className={`erda-gantt-grid-row ${selectedTask?.id === task.id ? 'erda-gantt-grid-row-selected' : ''} ${
          !validTask ? 'on-add' : ''
        }`}
      />,
    );
    y += rowHeight;
  }

  const { changedTask } = ganttEvent || {};
  const realHeight = tasks.length * rowHeight;

  const getRangePos = () => {
    if (changedTask) {
      return {
        // x: changedTask.x1,
        // y: 0,
        transform: `translate(${changedTask.x1},0)`,
        width: changedTask.x2 - changedTask.x1,
        height: max([ganttHeight, realHeight]),
      };
    } else if (startPos && endPos) {
      return {
        // x: min([startPos[0], endPos[0]]),
        // y: 0,
        transform: `translate(${min([startPos[0], endPos[0]])},0)`,
        width: Math.abs(endPos[0] - startPos[0]),
        height: max([ganttHeight, realHeight]),
      };
    }
    return null;
  };

  const rangePos = getRangePos();

  return (
    <g
      className="gridBody"
      onMouseDown={onMouseDown}
      onMouseUp={() => {
        onMouseUp();
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={mouseUnFocus}
    >
      {rangePos ? (
        <g>
          <rect {...rangePos} className="erda-gantt-grid-changed-range" />
        </g>
      ) : null}
      <g className="rows">{gridRows}</g>
      {startPos && endPos ? (
        <g>
          <foreignObject
            // x={min([startPos[0], endPos[0]])}
            // y={min([startPos[1], endPos[1]])}
            transform={`translate(${min([startPos[0], endPos[0]])},${min([startPos[1], endPos[1]])})`}
            width={Math.abs(startPos[0] - endPos[0])}
            height={Math.abs(startPos[1] - endPos[1])}
          >
            <div className="erda-gantt-grid-add-rect text-sm text-desc  bg-white bg-opacity-100 w-full h-full">{`${moment(
              addTime[0],
            ).format('YYYY-MM-DD')}~${moment(addTime[1]).format('YYYY-MM-DD')}`}</div>
          </foreignObject>
        </g>
      ) : null}
    </g>
  );
};

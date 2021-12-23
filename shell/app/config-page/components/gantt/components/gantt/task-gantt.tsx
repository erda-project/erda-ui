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
import { max } from 'lodash';
import { Button, Tooltip } from 'antd';
import ErdaIcon from 'common/components/erda-icon';
import { TaskGanttContentProps, TaskGanttContent } from './task-gantt-content';
import { useFullScreen } from 'app/common/use-hooks';
import i18n from 'i18n';
import './gantt.scss';

export interface TaskGanttProps {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  BarContentRender: React.ReactNode;
  screenChange: (value: boolean) => void,
  rootWrapper: React.ReactElement,
  scrollToToday: () => void,
}
export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  BarContentRender,
  screenChange,
  rootWrapper,
  scrollToToday,
}) => {
  const [isFullScreen, { toggleFullscreen }] = useFullScreen(rootWrapper, {
    onEnter: () => {
      screenChange(true);
    },
    onExit: () => {
      screenChange(false);
    },
  });
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const newBarProps = { ...barProps, svg: ganttSVGRef };
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const offsetWidth = verticalGanttContainerRef?.current?.offsetWidth;
  const [mousePos, setMousePos] = React.useState<null | number[]>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const gridPos = e.currentTarget.getBoundingClientRect();
    const mouseY = max([e.clientY - gridPos.y, 0]);
    const mouseX = max([e.clientX - gridPos.x]);
    setMousePos([Math.floor(mouseX / gridProps.columnWidth), Math.floor(mouseY / gridProps.rowHeight)]);
  };

  const mouseUnFocus = () => {
    setMousePos(null);
  };

  return (
    <div className={'erda-gantt-vertical-container'} dir="ltr" ref={verticalGanttContainerRef}>
      <Calendar
        {...calendarProps}
        width={max([calendarProps.width, offsetWidth])}
        displayWidth={offsetWidth}
        mousePos={mousePos}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={max([gridProps.svgWidth, offsetWidth])}
        height={barProps.rowHeight * barProps.tasks.length}
        fontFamily={barProps.fontFamily}
        style={{ overflow: 'visible' }}
        ref={ganttSVGRef}
      >
        <g onMouseMove={onMouseMove} onMouseLeave={mouseUnFocus}>
          <Grid
            {...gridProps}
            svgWidth={max([gridProps.svgWidth, offsetWidth])}
            displayWidth={offsetWidth}
            onMouseMove={onMouseMove}
            mouseUnFocus={mouseUnFocus}
            mousePos={mousePos}
          />
        </g>
        <TaskGanttContent {...newBarProps} displayWidth={offsetWidth} BarContentRender={BarContentRender} />
      </svg>
      <div className="absolute bottom-4 right-4 flex">
        <Tooltip
          getTooltipContainer={(e) => e.parentNode}
          placement={isFullScreen ? 'bottomRight' : undefined}
          title={i18n.t('dop:position to today')}
        >
          <Button onClick={() => scrollToToday()} className='text-sub hover:text-default cursor-pointer hover:border-default'>
            {i18n.t('Today')}
          </Button>
        </Tooltip>
        <Tooltip
          getTooltipContainer={(e) => e.parentNode}
          placement={isFullScreen ? 'bottomRight' : undefined}
          title={isFullScreen ? i18n.t('exit full screen') : i18n.t('full screen')}
        >
          <Button onClick={toggleFullscreen} className='flex justify-center items-center text-sub hover:text-default cursor-pointer hover:border-default'>
            <ErdaIcon
              onClick={toggleFullscreen}
              type={isFullScreen ? 'suoxiao' : 'fangda'}
              className=""
              size={16}
            />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

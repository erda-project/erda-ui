import React from 'react';
import './calendar.scss';

interface TopPartOfCalendarProps {
  value: string;
  x1Line: number;
  y1Line: number;
  y2Line: number;
  xText: number;
  yText: number;
}

export const TopPartOfCalendar: React.FC<TopPartOfCalendarProps> = ({
  value,
  x1Line,
  y1Line,
  y2Line,
  xText,
  yText,
}) => {
  return (
    <g className="erda-gantt-calendar-top">
      <line
        x1={x1Line}
        y1={y1Line}
        x2={x1Line}
        y2={y2Line}
        className={'erda-gantt-calendar-top-tick'}
        key={`${value}line`}
      />
      <text key={`${value}text`} y={yText} x={xText} className={'erda-gantt-calendar-top-text'}>
        {value}
      </text>
    </g>
  );
};

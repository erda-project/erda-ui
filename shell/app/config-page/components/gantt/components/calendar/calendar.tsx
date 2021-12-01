import React, { ReactChild } from 'react';
import { ViewMode } from '../../types/public-types';
import { TopPartOfCalendar } from './top-part-of-calendar';
import {
  getCachedDateTimeFormat,
  getDaysInMonth,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers/date-helper';
import { DateSetup } from '../../types/date-setup';
import './calendar.scss';

export interface CalendarProps {
  dateSetup: DateSetup;
  locale: string;
  viewMode: ViewMode;
  rtl: boolean;
  headerHeight: number;
  columnWidth: number;
  fontFamily: string;
  fontSize: string;
  ganttEvent: Obj;
}

const Days = ['日', '一', '二', '三', '四', '五', '六'];
const Months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export const Calendar: React.FC<CalendarProps> = ({
  dateSetup,
  locale,
  viewMode,
  rtl,
  headerHeight,
  columnWidth,
  tasks,
  fontFamily,
  fontSize,
  ganttEvent,
  selectedTask,
}) => {
  const getCalendarValuesForMonth = () => {
    const topValues: ReactChild[] = [];
    const bottomValues: ReactChild[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = getLocaleMonth(date, locale);
      bottomValues.push(
        <text
          key={bottomValue + date.getFullYear()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={'erda-gantt-calendar-bottom-text'}
        >
          {bottomValue}
        </text>,
      );
      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />,
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForWeek = () => {
    const topValues: ReactChild[] = [];
    const bottomValues: ReactChild[] = [];
    let weeksCount: number = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      let topValue = '';
      if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
        // top
        topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
      }
      // bottom
      const bottomValue = `W${getWeekNumberISO8601(date)}`;

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={'erda-gantt-calendar-bottom-text'}
        >
          {bottomValue}
        </text>,
      );

      if (topValue) {
        // if last day is new month
        if (i !== dates.length - 1) {
          topValues.push(
            <TopPartOfCalendar
              key={topValue}
              value={topValue}
              x1Line={columnWidth * i + weeksCount * columnWidth}
              y1Line={0}
              y2Line={topDefaultHeight}
              xText={columnWidth * i + columnWidth * weeksCount * 0.5}
              yText={topDefaultHeight * 0.9}
            />,
          );
        }
        weeksCount = 0;
      }
      weeksCount++;
    }
    return [topValues, bottomValues];
  };

  const getHoverDate = () => {
    const curSelected = selectedTask && tasks?.find((item) => item.id === selectedTask.id);
    const curTask = ganttEvent?.changedTask || curSelected;
    if (curTask) {
      return (
        <div
          className="absolute rounded bg-hover-gray-bg"
          style={{ width: curTask.x2 - curTask.x1, height: 40, left: curTask.x1, top: 24 }}
        />
      );
    }
    return null;
  };

  const getCalendarValuesForDay = () => {
    let bottomValues: React.ReactNode = null;
    const { dates } = dateSetup;
    const dateInWeeks = [];

    for (let i = 0; i < dates.length; i++) {
      const day = dates[i].getDay();
      if (i === 0) {
        dateInWeeks.push(dates.slice(0, 7 - day + 1));
      } else if (day === 1) {
        dateInWeeks.push(dates.slice(i, i + 7));
      }
    }
    let leftDis = 0;
    bottomValues = (
      <div className="relative h-full w-full erda-gantt-calendar-header-container">
        {getHoverDate()}
        {dateInWeeks.map((week, idx) => {
          const weekWidth = columnWidth * week.length;
          leftDis += weekWidth;
          return (
            <div
              key={`${idx}`}
              style={{ width: weekWidth, height: 60, top: 0, left: leftDis - weekWidth }}
              className="text-center absolute text-xs"
            >
              <div className="text-black-300" style={{ width: weekWidth, height: 20 }}>
                {Months[week[0].getMonth()]}
              </div>
              {week.map((day, dIdx) => {
                return (
                  <div
                    key={day.getTime()}
                    style={{ width: columnWidth, height: 40, left: columnWidth * dIdx, top: 24 }}
                    className={`absolute flex flex-col items-center justify-center text-sub ${
                      [0, 6].includes(day.getDay()) ? 'text-black-300' : ''
                    }`}
                  >
                    <span>{Days[day.getDay()]}</span>
                    <span>{day.getDate()}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
    return bottomValues;
  };

  const getCalendarValuesForOther = () => {
    const topValues: ReactChild[] = [];
    const bottomValues: ReactChild[] = [];
    const ticks = viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: 'numeric',
      }).format(date);

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={'erda-gantt-calendar-bottom-text'}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>,
      );
      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${date.getDate()} ${getLocaleMonth(date, locale)}`;
        topValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * i + ticks * columnWidth}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * i + ticks * columnWidth * 0.5}
            yText={topDefaultHeight * 0.9}
          />,
        );
      }
    }

    return [topValues, bottomValues];
  };

  // let topValues: ReactChild[] = [];
  // let bottomValues: ReactChild[] = [];
  // switch (dateSetup.viewMode) {
  //   // case ViewMode.Month:
  //   //   [topValues, bottomValues] = getCalendarValuesForMonth();
  //   //   break;
  //   // case ViewMode.Week:
  //   //   [topValues, bottomValues] = getCalendarValuesForWeek();
  //   //   break;
  //   case ViewMode.Day:
  //     [topValues, bottomValues] = getCalendarValuesForDay();
  //     break;
  //   default:
  //     [topValues, bottomValues] = getCalendarValuesForOther();
  //     break;
  // }
  return (
    <g className="erda-gantt-calendar" fontSize={fontSize} fontFamily={fontFamily}>
      <rect
        x={0}
        y={0}
        width={columnWidth * dateSetup.dates.length}
        height={headerHeight}
        className={'erda-gantt-calendar-header'}
      />
      <foreignObject
        x={0}
        y={0}
        width={columnWidth * dateSetup.dates.length}
        height={headerHeight}
        className={'erda-gantt-calendar-header'}
      >
        {getCalendarValuesForDay()}
      </foreignObject>
      {/* {topValues} */}
    </g>
  );
};

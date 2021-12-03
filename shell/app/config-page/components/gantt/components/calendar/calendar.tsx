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
import { ViewMode } from '../../types/public-types';
import { TopPartOfCalendar } from './top-part-of-calendar';
import {
  getCachedDateTimeFormat,
  getDaysInMonth,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers/date-helper';
import { DateSetup } from '../../types/date-setup';
import i18n from 'i18n';
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

const Days = [i18n.t('Sun'), i18n.t('Mon'), i18n.t('Tue'), i18n.t('Wed'), i18n.t('Thu'), i18n.t('Fri'), i18n.t('Sat')];
const Months = [
  i18n.t('January'),
  i18n.t('February'),
  i18n.t('March'),
  i18n.t('April'),
  i18n.t('May'),
  i18n.t('June'),
  i18n.t('July'),
  i18n.t('August'),
  i18n.t('September'),
  i18n.t('October'),
  i18n.t('November'),
  i18n.t('December'),
];
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
  rangeAddTime,
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

  const curSelected = selectedTask && tasks?.find((item) => item.id === selectedTask.id);
  const curTask = ganttEvent?.changedTask || curSelected;
  const hoverPos = rangeAddTime || curTask;

  const HoverBar = hoverPos ? (
    <div
      className="absolute rounded bg-hover-gray-bg"
      style={{ width: hoverPos.x2 - hoverPos.x1, height: 40, left: hoverPos.x1, top: 24 }}
    />
  ) : null;
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
        {HoverBar}
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
                const mark =
                  curSelected?.x1 === columnWidth * dIdx + leftDis - weekWidth ||
                  curSelected?.x2 === columnWidth * (dIdx + 1) + leftDis - weekWidth;
                const cls = `${
                  mark
                    ? 'calendar-mark-text'
                    : `${[0, 6].includes(day.getDay()) ? 'calendar-disabled-text' : 'calendar-normal-text'}`
                }`;

                return (
                  <div
                    key={day.getTime()}
                    style={{ width: columnWidth, height: 40, left: columnWidth * dIdx, top: 24 }}
                    className={`absolute flex flex-col items-center justify-center  ${cls}`}
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

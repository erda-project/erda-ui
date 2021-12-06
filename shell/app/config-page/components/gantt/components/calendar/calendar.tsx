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
  addToDate,
  getCachedDateTimeFormat,
  getDaysInMonth,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers/date-helper';
import { min } from 'lodash';
import { DateSetup } from '../../types/date-setup';
import i18n from 'i18n';
import './calendar.scss';

export interface CalendarProps {
  dateSetup: DateSetup;
  locale: string;
  viewMode: ViewMode;
  rtl: boolean;
  width: number;
  height: number;
  columnWidth: number;
  fontFamily: string;
  fontSize: string;
  horizontalRange: number[];
  highlightRange?: {
    x1: number;
    x2: number;
    [x: string]: any;
  };
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
export const Calendar: React.FC<CalendarProps> = React.memo(
  ({
    dateSetup,
    locale,
    viewMode,
    rtl,
    width,
    height,
    columnWidth,
    horizontalRange,
    fontFamily,
    fontSize,
    highlightRange,
  }) => {
    const getCalendarValuesForMonth = () => {
      const topValues: ReactChild[] = [];
      const bottomValues: ReactChild[] = [];
      const topDefaultHeight = height * 0.5;
      for (let i = 0; i < dateSetup.dates.length; i++) {
        const date = dateSetup.dates[i];
        const bottomValue = getLocaleMonth(date, locale);
        bottomValues.push(
          <text
            key={bottomValue + date.getFullYear()}
            y={height * 0.8}
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
      const topDefaultHeight = height * 0.5;
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
            y={height * 0.8}
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

    const HoverBar = highlightRange ? (
      <div
        className="absolute rounded bg-hover-gray-bg"
        style={{
          width: Math.abs(highlightRange.x2 - highlightRange.x1),
          height: 40,
          left: min([highlightRange.x1, highlightRange.x2]),
          top: 24,
        }}
      />
    ) : null;
    const getCalendarValuesForDay = () => {
      let bottomValues: React.ReactNode = null;
      const dates = dateSetup.dates.slice(...horizontalRange);
      const dateInWeeks = [];

      const firstDay = dates[0];
      const firstDayInWeek = firstDay.getDay();
      // use Monday as first day of week
      const firstWeek = dates.splice(0, firstDayInWeek === 0 ? 7 : 7 - firstDayInWeek + 1);
      while (firstWeek.length < 7) {
        const firstDayInFirstWeek = firstWeek[0];
        firstWeek.unshift(addToDate(firstDayInFirstWeek, -1, 'day'));
      }
      dateInWeeks.push(firstWeek);
      while (dates.length) {
        dateInWeeks.push(dates.splice(0, 7));
      }
      const lastWeek = dateInWeeks[dateInWeeks.length - 1];
      while (lastWeek.length < 7) {
        const lastDayInLastWeek = lastWeek[lastWeek.length - 1];
        lastWeek.push(addToDate(lastDayInLastWeek, 1, 'day'));
      }
      let leftDis = 0;
      bottomValues = (
        <div
          className="flex h-full w-full erda-gantt-calendar-header-container"
          style={{ transform: `translateX(${-(firstDayInWeek + 1) * columnWidth}px)` }}
        >
          {HoverBar}
          {dateInWeeks.map((week, idx) => {
            const weekWidth = columnWidth * week.length;
            leftDis += weekWidth;
            return (
              <div key={`${idx}`} style={{ width: weekWidth, height: 60, top: 0 }} className="text-center text-xs">
                <div className="text-black-300" style={{ height: 20, lineHeight: '20px' }}>
                  {Months[week[0].getMonth()]}
                </div>
                <div className="flex">
                  {week.map((day, dIdx) => {
                    const mark =
                      highlightRange?.x1 === columnWidth * dIdx + leftDis - weekWidth ||
                      highlightRange?.x2 === columnWidth * (dIdx + 1) + leftDis - weekWidth;
                    const cls = `${
                      mark
                        ? 'calendar-highlight-text'
                        : `${[0, 6].includes(day.getDay()) ? 'calendar-disabled-text' : 'calendar-normal-text'}`
                    }`;

                    return (
                      <div
                        key={day.getTime()}
                        style={{
                          width: columnWidth,
                          height: 40,
                          top: 24,
                        }}
                        className={`flex flex-col items-center justify-center ${cls}`}
                      >
                        <span>{Days[day.getDay()]}</span>
                        <span>{day.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
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
      const topDefaultHeight = height * 0.5;
      const dates = dateSetup.dates;
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const bottomValue = getCachedDateTimeFormat(locale, {
          hour: 'numeric',
        }).format(date);

        bottomValues.push(
          <text
            key={date.getTime()}
            y={height * 0.8}
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
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fontFamily={fontFamily}>
        <g className="erda-gantt-calendar" fontSize={fontSize}>
          <rect
            x={0}
            y={0}
            width={columnWidth * dateSetup.dates.length}
            height={height}
            className={'erda-gantt-calendar-header'}
          />
          <foreignObject
            x={0}
            y={0}
            width={columnWidth * dateSetup.dates.length}
            height={height}
            className={'erda-gantt-calendar-header'}
          >
            {getCalendarValuesForDay()}
          </foreignObject>
          {/* {topValues} */}
        </g>
      </svg>
    );
  },
);

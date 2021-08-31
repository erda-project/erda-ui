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

import i18n from 'i18n';
import moment, { Moment } from 'moment';

export interface ITimeRange {
  mode: 'quick' | 'customize';
  quick?: string;
  customize: {
    start?: Moment;
    end?: Moment;
  };
}

export const defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export const relativeTimeRange = [
  { label: i18n.t('last {count} {unit}', { count: 15, unit: i18n.t('common:minutes') }), value: 'minutes:15' },
  { label: i18n.t('last {count} {unit}', { count: 30, unit: i18n.t('common:minutes') }), value: 'minutes:30' },
  { label: i18n.t('last {count} {unit}', { count: 1, unit: i18n.t('hours') }), value: 'hours:1' },
  { label: i18n.t('last {count} {unit}', { count: 3, unit: i18n.t('hours') }), value: 'hours:3' },
  { label: i18n.t('last {count} {unit}', { count: 6, unit: i18n.t('hours') }), value: 'hours:6' },
  { label: i18n.t('last {count} {unit}', { count: 12, unit: i18n.t('hours') }), value: 'hours:12' },
  { label: i18n.t('last {count} {unit}', { count: 1, unit: i18n.t('days') }), value: 'days:1' },
  { label: i18n.t('last {count} {unit}', { count: 3, unit: i18n.t('days') }), value: 'days:3' },
  { label: i18n.t('last {count} {unit}', { count: 1, unit: i18n.t('weeks') }), value: 'weeks:1' },
  { label: i18n.t('last {count} {unit}', { count: 1, unit: i18n.t('months') }), value: 'months:1' },
  { label: i18n.t('last {count} {unit}', { count: 3, unit: i18n.t('months') }), value: 'months:3' },
  { label: i18n.t('last {count} {unit}', { count: 6, unit: i18n.t('months') }), value: 'months:6' },
  { label: i18n.t('today'), value: 'today' },
  { label: i18n.t('yesterday'), value: 'yesterday' },
  { label: i18n.t('current week'), value: 'currentWeek' },
  { label: i18n.t('last week'), value: 'lastWeek' },
  { label: i18n.t('current month'), value: 'currentMonth' },
  { label: i18n.t('last month'), value: 'lastMonth' },
];

export const autoRefreshDuration = [
  { label: '5s', value: 'seconds:5' },
  { label: '10s', value: 'seconds:10' },
  { label: '30s', value: 'seconds:30' },
  { label: '1m', value: 'minutes:1' },
  { label: '5m', value: 'minutes:5' },
  { label: '30m', value: 'minutes:30' },
  { label: '1h', value: 'hours:1' },
  { label: '2h', value: 'hours:2' },
  { label: '1d', value: 'days:1' },
];

/**
 * @description convert relative time range to absolute time range
 * @param unit
 * @param count
 * @returns {[Moment, Moment]}
 */
export const translateRelativeTime = (unit: string, count?: number) => {
  let start = moment();
  let end = start.clone();
  switch (unit) {
    case 'minutes':
    case 'hours':
    case 'days':
    case 'weeks':
    case 'months':
      start = start.subtract(count, unit);
      break;
    case 'today':
      start = start.startOf('day');
      break;
    case 'yesterday':
      start = start.startOf('day').subtract(1, 'days');
      end = end.endOf('day').subtract(1, 'days');
      break;
    case 'currentWeek':
      start = start.startOf('week');
      break;
    case 'lastMonth':
      start = start.startOf('month').subtract(1, 'months');
      end = end.endOf('month').subtract(1, 'months');
      break;
    case 'lastWeek':
      start = start.startOf('week').subtract(1, 'weeks');
      end = end.endOf('week').subtract(1, 'weeks');
      break;
    case 'currentMonth':
      start = start.startOf('month');
      break;
    default:
      start = start.startOf('day');
      break;
  }
  return [start, end];
};

/**
 * @description calculate the auto refresh duration
 * @param count
 * @param unit
 * @return {number}
 */
export const translateAutoRefreshDuration = (count: number, unit: string) => {
  const map = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  };
  return count * map[unit];
};

export const transformRange = (v: ITimeRange, format = defaultFormat) => {
  let dateStr;
  let dateArr: Moment[] = [];
  if (v.mode === 'quick') {
    const { label, value } = relativeTimeRange.find((t) => t.value === v.quick) ?? {};
    dateStr = label;
    const [unit, count] = value?.split(':') || [];
    if (unit) {
      dateArr = translateRelativeTime(unit, parseInt(count, 10));
    }
  } else if (v.mode === 'customize') {
    const { start, end } = v.customize;
    if (start && end) {
      dateStr = `${start.format(format)} - ${end.format(format)}`;
      dateArr = [start, end];
    }
  }
  return {
    date: dateArr,
    dateStr,
  };
};

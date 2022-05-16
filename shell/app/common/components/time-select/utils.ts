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

export type IRelativeTime = keyof typeof relativeTimeRange;

export type IRefreshDuration = keyof typeof autoRefreshDuration;

export interface ITimeRange {
  mode: 'quick' | 'customize';
  quick?: IRelativeTime;
  customize: {
    start?: Moment;
    end?: Moment;
  };
}

export const defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export const relativeTimeRange = {
  'minutes:15': `${i18n.t('last')} ${i18n.t('{num} minutes', { num: 15 })}`,
  'minutes:30': `${i18n.t('last')} ${i18n.t('{num} minutes', { num: 30 })}`,
  'hours:1': `${i18n.t('last')} ${i18n.t('{num} hour', { num: 1 })}`,
  'hours:3': `${i18n.t('last')} ${i18n.t('{num} hours', { num: 3 })}`,
  'hours:6': `${i18n.t('last')} ${i18n.t('{num} hours', { num: 6 })}`,
  'hours:12': `${i18n.t('last')} ${i18n.t('{num} hours', { num: 12 })}`,
  'days:1': `${i18n.t('last')} ${i18n.t('{num} day', { num: 1 })}`,
  'days:3': `${i18n.t('last')} ${i18n.t('{num} days', { num: 3 })}`,
  'weeks:1': `${i18n.t('last')} ${i18n.t('{num} week', { num: 1 })}`,
  'months:1': `${i18n.t('last')} ${i18n.t('{num} mouth', { num: 1 })}`,
  'months:3': `${i18n.t('last')} ${i18n.t('{num} mouths', { num: 3 })}`,
  'months:6': `${i18n.t('last')} ${i18n.t('{num} mouths', { num: 6 })}`,
  today: i18n.t('today'),
  yesterday: i18n.t('Yesterday'),
  currentWeek: i18n.t('This week'),
  lastWeek: i18n.t('Last week'),
  currentMonth: i18n.t('This month'),
  lastMonth: i18n.t('Last month'),
};

export const autoRefreshDuration = {
  'seconds:5': '5s',
  'seconds:10': '10s',
  'seconds:30': '30s',
  'minutes:1': '1m',
  'minutes:5': '5m',
  'minutes:30': '30m',
  'hours:1': '1h',
  'hours:2': '2h',
  'days:1': '1d',
};

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
      end = end.subtract(1, 'months').endOf('month');
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
  if (v.mode === 'quick' && v.quick) {
    dateStr = relativeTimeRange[v.quick];
    const [unit, count] = v.quick?.split(':') || [];
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

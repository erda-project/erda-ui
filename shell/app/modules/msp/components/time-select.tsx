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

import React from 'react';
import { DatePicker, Dropdown, Select } from 'core/nusi';
import { produce } from 'immer';
import { useMount } from 'react-use';
import moment, { Moment } from 'moment';
import { SelectProps } from 'core/common/interface';
import i18n from 'i18n';
import { Refresh as IconRefresh, Time as IconTime, DownOne as IconDownOne } from '@icon-park/react';
import './time-select.scss';
import { useUpdate } from 'common';
import { cloneDeep } from 'lodash';
import monitorCommonStore from 'common/stores/monitorCommon';
import { getTimeSpan } from 'common/utils';

const { Option } = Select;

const relativeTimeRange = [
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

const autoRefreshDuration = [
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

const AutoRefreshStrategy = (props: SelectProps<string>) => {
  return (
    <div className="auto-refresh relative border-all hover:border-primary">
      <Select defaultValue="off" bordered={false} dropdownMatchSelectWidth={false} {...props}>
        <Option value="off">OFF</Option>
        {autoRefreshDuration.map((item) => {
          return <Option value={item.value}>{item.label}</Option>;
        })}
      </Select>
    </div>
  );
};

export interface ITimeRange {
  mode: 'quick' | 'customize';
  quick?: string;
  customize: {
    start?: Moment;
    end?: Moment;
  };
}

interface ITimeRangeState {
  data: ITimeRange;
  startOpen: boolean;
  endOpen: boolean;
}

interface ITimeRangeProps {
  format?: string;
  value?: ITimeRange;

  onChange(data: ITimeRange): void;
}

const TimeRange = ({ onChange, value, format }: ITimeRangeProps) => {
  const [{ startOpen, endOpen, data }, updater, update] = useUpdate<ITimeRangeState>({
    data: value ?? ({} as ITimeRange),
    startOpen: false,
    endOpen: false,
  });
  const dateRange = React.useRef<ITimeRange['customize']>(cloneDeep(data.customize || {}));
  const triggerChange = (changedValue: ITimeRange) => {
    onChange?.({ ...data, ...value, ...changedValue });
  };

  const handleSelectQuickTimeRange = (str: string) => {
    const v = value ?? data;
    const newData = produce(v, (draft) => {
      draft.mode = 'quick';
      draft.quick = str;
      draft.customize = {
        start: undefined,
        end: undefined,
      };
    });
    dateRange.current.end = undefined;
    dateRange.current.start = undefined;
    if (!('quick' in (value ?? {}))) {
      updater.data(newData);
    }
    triggerChange(newData);
  };

  const handleChangeDate = React.useCallback(
    (flag: string, date: Moment | null, _: string) => {
      const v = value ?? data;
      const newData = produce(v, (draft) => {
        draft.mode = 'customize';
        draft.quick = undefined;
        if (!draft.customize) {
          draft.customize = {};
        }
        draft.customize[flag] = date;
      });
      dateRange.current[flag] = date;
      const { start, end } = dateRange.current;
      const newState: Partial<ITimeRangeState> = {
        startOpen: !start,
        endOpen: !end,
      };
      if (!('customize' in (value ?? {}))) {
        newState.data = newData;
      }
      update(newState);
      if (start && end) {
        triggerChange({
          mode: 'customize',
          customize: { start, end },
          quick: undefined,
        });
      }
    },
    [data, value],
  );
  const disabledStart = (current: Moment) => {
    return current && dateRange.current.end && current > dateRange.current.end;
  };

  const disabledEnd = (current: Moment) => {
    return current && dateRange.current.start && current < dateRange.current.start;
  };

  const mode = value?.mode || data.mode;
  const activeQuick = value?.quick || data.quick;
  const start = mode === 'customize' ? value?.customize.start || data?.customize.start : undefined;
  const end = mode === 'customize' ? value?.customize.end || data?.customize.end : undefined;

  return (
    <div className="flex h-full items-stretch">
      <div className="w-56 h-full px-3">
        <p className="pt-3 font-medium">{i18n.t('absolute time range')}</p>
        <p className="mt-3 mb-1">{i18n.t('common:start at')}</p>
        <DatePicker
          format={format}
          disabledDate={disabledStart}
          disabledTime={disabledStart}
          allowClear={false}
          open={startOpen}
          onOpenChange={updater.startOpen}
          showTime
          className="w-full"
          value={start}
          onChange={(...arg) => {
            handleChangeDate('start', ...arg);
          }}
        />
        <p className="mt-3 mb-1">{i18n.t('common:end at')}</p>
        <DatePicker
          format={format}
          disabledDate={disabledEnd}
          disabledTime={disabledEnd}
          allowClear={false}
          open={endOpen}
          onOpenChange={updater.endOpen}
          showTime
          className="w-full"
          value={end}
          onChange={(...arg) => {
            handleChangeDate('end', ...arg);
          }}
        />
      </div>
      <div className="w-44 h-full border-left flex flex-col">
        <p className="px-3 pt-3 font-medium">{i18n.t('relative time range')}</p>
        <ul className="overflow-y-auto flex-1 mt-3">
          {relativeTimeRange.map((item) => {
            return (
              <li
                className={`h-9 px-3 flex items-center hover:bg-grey cursor-pointer ${
                  mode === 'quick' && activeQuick === item.value ? 'text-primary font-medium' : ''
                }`}
                key={item.value}
                onClick={() => {
                  handleSelectQuickTimeRange(item.value);
                }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

interface IState {
  data: ITimeRange;
  strategy: string;
  refreshDuration: number;
  visible: boolean;
  text?: string;
}

interface IProps {
  className?: string;
  triggerChangeOnMounted?: boolean;
  defaultValue?: ITimeRange;
  strategy?: string;
  defaultStrategy?: string;
  value?: ITimeRange;
  defaultRefreshDuration?: string;
  refreshDuration?: string;
  format?: string;

  onRefreshStrategyChange?(strategy: string): void;

  onChange?(data: ITimeRange, range: Moment[]): void;
}

const defaultFormat = 'YYYY-MM-DD HH:mm:ss';

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

const TimeSelect = (props: IProps) => {
  const format = props.format ?? defaultFormat;
  const [{ visible, text, strategy, refreshDuration, data }, updater, update] = useUpdate<IState>({
    refreshDuration: -1,
    strategy: props.defaultStrategy || 'off',
    visible: false,
    data: props.defaultValue ?? {
      mode: '',
      customize: {},
      quick: undefined,
    },
    text: props.defaultValue ? transformRange(props.defaultValue, format).dateStr : '',
  });
  const timer = React.useRef();
  const payload = React.useRef<ITimeRange>(props.defaultValue || ({} as ITimeRange));
  useMount(() => {
    if (props.triggerChangeOnMounted) {
      handleManualRefresh();
    }
  });

  const refreshStrategy = props.strategy ?? strategy;
  React.useEffect(() => {
    const isAutoRefresh = refreshStrategy !== 'off';
    let duration = -1;
    if (isAutoRefresh) {
      const [unit, count] = refreshStrategy.split(':') || [];
      duration = translateAutoRefreshDuration(parseInt(count, 10), unit);
    }
    updater.refreshDuration(duration);
  }, [refreshStrategy]);

  React.useEffect(() => {
    openAutoRefresh();
    return () => {
      closeAutoRefresh();
    };
  }, [refreshDuration]);

  /**
   * @description open auto refresh
   */
  const openAutoRefresh = () => {
    closeAutoRefresh();
    if (refreshDuration === -1) {
      return;
    }
    timer.current = setInterval(() => {
      const { date } = transformRange(payload.current, format);
      props?.onChange?.(payload.current, date);
    }, refreshDuration);
  };

  /**
   * @description close auto refresh
   */
  const closeAutoRefresh = () => {
    timer.current && clearInterval(timer.current);
    timer.current = undefined;
  };

  /**
   * @description select date
   * @param data
   */
  const handleSelectDate = (data: ITimeRange) => {
    const { date, dateStr } = transformRange(data, format);
    const newState: Partial<IState> = {
      text: dateStr,
      visible: false,
    };
    payload.current = data;
    if (!('value' in (props?.value ?? {}))) {
      newState.data = data;
    }
    update(newState);
    props.onChange?.(data, date);
  };

  /**
   * @description switch refresh strategy
   * @param strategy
   */
  const handleChangeRefreshStrategy = (strategy: string) => {
    if (!('strategy' in props)) {
      updater.strategy(strategy);
    }
    props?.onRefreshStrategyChange?.(strategy);
  };

  /**
   * @description manual refresh
   */
  const handleManualRefresh = () => {
    const { date } = transformRange(payload.current, format);
    props?.onChange?.(payload.current, date);
  };

  return (
    <div className={`time-select h-8 flex rounded ${props.className ?? ''}`}>
      <Dropdown
        visible={visible}
        trigger={['click']}
        overlayClassName="time-range-dropdown bg-white"
        overlay={
          <TimeRange format={format} key={`${visible}`} value={props?.value ?? data} onChange={handleSelectDate} />
        }
        onVisibleChange={updater.visible}
      >
        <div
          className="time-range cursor-pointer border-all rounded-l flex items-center px-2 hover:border-primary"
          onClick={() => {
            updater.visible(true);
          }}
        >
          <IconTime className="-mt-0.5" theme="outline" size="16" fill="#070A1A" />
          {text}
        </div>
      </Dropdown>
      <AutoRefreshStrategy
        suffixIcon={<IconDownOne className="ml-1.5 -mt-0.5" theme="filled" size="12" fill="#bbb" />}
        style={{ width: 70 }}
        defaultValue={refreshStrategy}
        onChange={handleChangeRefreshStrategy}
      />
      <div className="manual-refresh flex justify-center items-center w-8 relative border-all rounded-r hover:border-primary">
        <IconRefresh className="m-0 cursor-pointer" fill="#070A1A" onClick={handleManualRefresh} />
      </div>
    </div>
  );
};

export const TimeSelectWithStore = ({ className }: { className?: string }) => {
  const globalTimeSelectSpan = monitorCommonStore.getState((s) => s.globalTimeSelectSpan);
  const handleChange = (data: ITimeRange, range: Moment[]) => {
    const triggerTime = Date.now();
    const span = getTimeSpan(range);
    monitorCommonStore.reducers.updateState({
      globalTimeSelectSpan: {
        ...globalTimeSelectSpan,
        data,
        range: {
          triggerTime,
          ...span,
        },
      },
    });
  };
  const handleChangeStrategy = (strategy: string) => {
    monitorCommonStore.reducers.updateState({
      globalTimeSelectSpan: {
        ...globalTimeSelectSpan,
        refreshStrategy: strategy,
      },
    });
  };
  return (
    <TimeSelect
      defaultValue={globalTimeSelectSpan.data}
      className={className}
      onChange={handleChange}
      defaultStrategy={globalTimeSelectSpan.refreshStrategy}
      onRefreshStrategyChange={handleChangeStrategy}
    />
  );
};

export default TimeSelect;

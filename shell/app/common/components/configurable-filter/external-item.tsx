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

import * as React from 'react';
import { Field, Option } from './index';
import { debounce, has, isNumber, isString, map } from 'lodash';
import { DatePicker, Dropdown, Input, Menu } from 'antd';
import { ErdaIcon } from 'common';
import moment, { Moment } from 'moment';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import './external-item.scss';
import { firstCharToUpper } from 'app/common/utils';

type Value = string | string[];
interface IProps {
  itemData: Field;
  value: Value;
  className?: string;
  onChange: (val?: Value) => void;
}

const { RangePicker } = DatePicker;

const filterMatch = (v: string, f: string) => v.toLowerCase().includes(f.toLowerCase());

export const getSelectOptions = (options: Option[], filterKey: string) => {
  if (!filterKey) return options;
  const useableOptions: Option[] = [];

  options.forEach((item) => {
    let curOp: Option | null = null;
    if (has(item, 'children')) {
      curOp = { ...item, children: [] };
      item.children?.forEach((cItem) => {
        if (filterMatch(`${cItem.label}`, filterKey)) {
          curOp?.children?.push(cItem);
        }
      });
      if (curOp.children?.length) useableOptions.push(curOp);
    } else if (filterMatch(`${item.label}`, filterKey)) {
      curOp = item;
      curOp && useableOptions.push(curOp);
    }
  });
  return useableOptions;
};

const ExternalItem = ({ itemData, value, onChange, className = '' }: IProps) => {
  const firstShowLength = 200;
  const {
    key,
    label,
    haveFilter,
    type,
    mode = 'multiple',
    placeholder,
    options,
    required,
    emptyText = i18n.t('dop:All'),
    getComp,
    customProps = {},
  } = itemData;
  const [filterValue, setFilterValue] = React.useState('');
  const [curValue, setCurValue] = React.useState(value);
  const [active, setActive] = React.useState(false);
  const [hasMore, setHasMore] = React.useState((options?.length || 0) > firstShowLength);

  const debouncedChange = React.useRef(debounce(onChange, 1000));

  useUpdateEffect(() => {
    setCurValue(value);
  }, [value]);

  useUpdateEffect(() => {
    if (curValue !== value) {
      debouncedChange?.current(curValue);
    }
  }, [curValue]);

  if (type === 'input') {
    return (
      <Input
        value={curValue}
        size="small"
        style={{ width: 180 }}
        allowClear
        className={`bg-default-06 border-none config-filter-item ${className}`}
        prefix={<ErdaIcon fill="default-3" size="16" type="search" />}
        placeholder={firstCharToUpper(placeholder?.toLowerCase())}
        onChange={(e) => setCurValue(e.target.value)}
      />
    );
  }

  const labels = <span className="text-desc mr-0.5 flex-all-center">{label}</span>;

  if (type === 'select') {
    const _value = curValue ? (isString(curValue) || isNumber(curValue) ? [curValue] : curValue) : [];
    const _options = options || [];
    const isSingleMode = mode === 'single';
    const valueText =
      _options
        .reduce((_optArr: Option[], _curOpt: Option) => _optArr.concat(_curOpt.children ?? _curOpt), [])
        .filter((a) => _value?.includes?.(a.value))
        .map((a) => a.label)
        .join(',') || emptyText;

    const filterOptions = getSelectOptions(_options, filterValue);
    const useOptions = hasMore ? filterOptions?.slice(0, firstShowLength) : filterOptions;
    const ops = (
      <Menu>
        {haveFilter && [
          <Menu.Item key="search-item options-item">
            <Input
              autoFocus
              size="small"
              placeholder={firstCharToUpper(i18n.t('search'))}
              prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
              value={filterValue}
              onChange={(e) => {
                const v = e.target.value;
                setFilterValue(v?.toLowerCase());
              }}
            />
          </Menu.Item>,
          <Menu.Divider key="divider1" />,
        ]}
        {!isSingleMode && [
          // 单选模式下不展示已选择n项
          <Menu.Item key="select-info" className="flex justify-between items-center not-select px6 py-0 options-item">
            <span>
              {i18n.t('common:Selected')} {_value.length} {i18n.t('common:items')}
            </span>
            {!required ? (
              <span className="fake-link ml-2" onClick={() => setCurValue()}>
                {i18n.t('common:Clear selected')}
              </span>
            ) : null}
          </Menu.Item>,
          <Menu.Divider key="divider2" />,
        ]}
        <Menu.Item key="options" className="p-0 options-container options-item block">
          {useOptions.map((op) => {
            if (has(op, 'children') && !op.children?.length) {
              return null;
            }
            const isGroup = op.children?.length;
            const onClickOptItem = (_curOpt: Option) => {
              if (isSingleMode) {
                if (required && _value.includes(_curOpt.value)) return;
                setCurValue(_value.includes(_curOpt.value) ? undefined : _curOpt.value);
                setActive(false);
              } else {
                const newVal = _value.includes(_curOpt.value)
                  ? _value.filter((v: string | number) => v !== _curOpt.value)
                  : _value.concat(_curOpt.value);
                if (required && !newVal.length) return;
                setCurValue(newVal);
              }
            };

            if (isGroup) {
              return (
                <GroupOpt
                  key={op.value || op.label}
                  value={_value}
                  firstShowLength={firstShowLength}
                  onClickOptItem={onClickOptItem}
                  option={op}
                />
              );
            } else {
              return <OptionItem key={op.value} value={_value} option={op} onClick={() => onClickOptItem(op)} />;
            }
          })}
          {hasMore ? (
            <div className="fake-link hover-active py-1 pl-3  load-more" onClick={() => setHasMore(false)}>
              {`${i18n.t('load more')}...`}
            </div>
          ) : null}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown
        trigger={['click']}
        visible={active}
        onVisibleChange={setActive}
        overlay={ops}
        overlayClassName="config-filter-item-dropdown"
        placement="bottomLeft"
      >
        <span className={`config-filter-item ${className}`}>
          {labels}
          <span className="config-filter-item-value nowrap">{valueText}</span>
          <ErdaIcon type="caret-down" className="hover" size="16" />
        </span>
      </Dropdown>
    );
  }

  if (type === 'dateRange') {
    const [_startDate, _endDate] = curValue || [];
    const startDate = typeof _startDate === 'string' ? +_startDate : _startDate;
    const endDate = typeof _endDate === 'string' ? +_endDate : _endDate;
    const { borderTime } = customProps || {};

    const disabledDate = (isStart: boolean) => (current: Moment | undefined) => {
      return (
        !!current &&
        (isStart
          ? endDate
            ? (borderTime ? current.startOf('dates') : current) > moment(endDate)
            : false
          : startDate
          ? (borderTime ? current.endOf('dates') : current) < moment(startDate)
          : false)
      );
    };

    const getTimeValue = (v: Moment[] | number[]) => {
      if (borderTime) {
        const startVal = v[0]
          ? moment(isString(v[0]) ? +v[0] : v[0])
              .startOf('dates')
              .valueOf()
          : v[0];
        const endVal = v[1]
          ? moment(isString(v[1]) ? +v[1] : v[1])
              .endOf('dates')
              .valueOf()
          : v[1];
        return [startVal, endVal];
      }
      return v;
    };

    return (
      <span className={`config-filter-item ${className}`}>
        {labels}
        <DatePicker
          size="small"
          bordered={false}
          value={startDate ? moment(startDate) : undefined}
          disabledDate={disabledDate(true)}
          format={'YYYY/MM/DD'}
          allowClear={!required}
          onChange={(v) => setCurValue(getTimeValue([v?.valueOf(), endDate]))}
          placeholder={i18n.t('common:Start date')}
        />
        <span className="text-desc">{i18n.t('common:to')}</span>
        <DatePicker
          size="small"
          bordered={false}
          allowClear={!required}
          value={endDate ? moment(endDate) : undefined}
          disabledDate={disabledDate(false)}
          format={'YYYY/MM/DD'}
          placeholder={i18n.t('common:End date')}
          onChange={(v) => setCurValue(getTimeValue([startDate, v?.valueOf()]))}
        />
      </span>
    );
  }

  if (type === 'rangePicker') {
    const { ranges, borderTime, selectableTime, ...customRest } = customProps;
    const valueConvert = (val: number[] | Moment[]) => {
      const convertItem = (v: number | Moment) => {
        if (moment.isMoment(v)) {
          return moment(v).valueOf();
        } else {
          return v && moment(v);
        }
      };
      return Array.isArray(val) ? val.map((vItem) => convertItem(vItem)) : convertItem(val);
    };

    /**
     * support object type for i18n
     * {
        LastWeek: {
          label: '近一周' | 'Last Week',
          range: []
        }
      }
     * @param _ranges
     * @returns
     */
    const rangeConvert = (_ranges?: Obj<number[]> | Obj<{ label: string; range: number[] }>) => {
      const reRanges = {};
      map(_ranges, (v, k) => {
        let _k = k;
        let _v = v;
        if (!Array.isArray(v)) {
          _k = v.label;
          _v = v.range;
        }
        reRanges[_k] = valueConvert(_v as number[]);
      });
      return reRanges;
    };
    const disabledDate = (_current: Moment) => {
      return (
        _current &&
        !(
          (selectableTime[0] ? _current > moment(selectableTime[0]) : true) &&
          (selectableTime[1] ? _current < moment(selectableTime[1]) : true)
        )
      );
    };
    return (
      <span className={`config-filter-item ${className}`}>
        {labels}
        <RangePicker
          value={valueConvert(curValue)}
          ranges={rangeConvert(ranges)}
          size="small"
          bordered={false}
          disabledDate={selectableTime ? disabledDate : undefined}
          onChange={(v) => {
            const val =
              borderTime && Array.isArray(v)
                ? v.map((vItem, idx) => {
                    if (idx === 0 && vItem) {
                      return vItem.startOf('dates');
                    } else if (idx === 1 && vItem) {
                      return vItem.endOf('dates');
                    }
                    return vItem;
                  })
                : v;
            setCurValue(valueConvert(val));
          }}
          {...customRest}
        />
      </span>
    );
  }

  if (getComp) {
    const comp = getComp({
      onChange: (v) => {
        setCurValue(v);
      },
    });
    return (
      <span className={`config-filter-item flex items-center ${className}`}>
        {labels}
        {comp}
      </span>
    );
  }
  return null;
};

interface IGroupOptProps {
  value: Array<string | number>;
  option: Option;
  firstShowLength?: number;
  onClickOptItem: (option: Option) => void;
}

const GroupOpt = (props: IGroupOptProps) => {
  const { option, onClickOptItem, value, firstShowLength } = props;
  const [expand, setExpand] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(
    firstShowLength ? (option.children?.length || 0) > firstShowLength : false,
  );

  const useOption = hasMore ? option.children?.slice(0, firstShowLength) : option.children;

  return (
    <div className={'option-group'}>
      <div className="option-group-label flex items-center justify-between" onClick={() => setExpand(!expand)}>
        <div className="flex items-center">{option.label}</div>
        <ErdaIcon type="down" className={`expand-icon flex items-center ${expand ? 'expand' : ''}`} size="16" />
      </div>
      <div className={`option-group-content ${expand ? '' : 'no-expand'}`}>
        {useOption?.map((cItem) => {
          return <OptionItem key={cItem.value} value={value} option={cItem} onClick={() => onClickOptItem(cItem)} />;
        })}
        {hasMore ? (
          <div className="fake-link hover-active py-1 pl-8  load-more" onClick={() => setHasMore(false)}>
            {`${i18n.t('load more')}...`}
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface IOptionItemProps {
  value: Array<string | number>;
  option: Option;
  onClick: (option: Option) => void;
}

const OptionItem = (props: IOptionItemProps) => {
  const { value, option, onClick } = props;
  return (
    <div
      className={`relative option-item ${(value || []).includes(option.value) ? 'checked-item' : ''}`}
      key={option.value}
      onClick={() => onClick(option)}
    >
      <div className="flex justify-between items-center w-full">
        <span>{option.label}</span>
        <span>
          {value.includes(option.value) ? <ErdaIcon type="check" size="14" color="green" className="ml-2" /> : null}
        </span>
      </div>
    </div>
  );
};

export default ExternalItem;

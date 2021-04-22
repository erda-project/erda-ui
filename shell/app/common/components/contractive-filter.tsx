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
import {
  Menu,
  Dropdown,
  Input,
  DatePicker,
  Checkbox,
} from 'app/nusi';
import { Icon as CustomIcon, MemberSelector } from 'common';
import moment, { Moment } from 'moment';
import { useUpdateEffect, useMount } from 'react-use';
import './contractive-filter.scss';
import { debounce, isEmpty, isArray, map, max, sortBy, isString } from 'lodash';
import i18n from 'i18n';

interface Option {
  label: string
  value: string | number
  icon: string
}

type ConditionType = 'select' | 'input' | 'dateRange';

interface ICondition {
  key: string
  label: string
  type: ConditionType
  emptyText?: string
  value?: string | number | string[] | number[] | Obj
  fixed?: boolean,
  showIndex?: number, // 0： 隐藏、其他显示
  haveFilter?: boolean,
  placeholder?: string,
  quickSelect?: {
    label: string,
    operationKey: string,
  }
  options?: Option[]
  customProps: Obj;
}

interface IFilterItemProps {
  itemData: ICondition,
  value: any,
  active: boolean,
  onVisibleChange(visible: boolean): void,
  onChange(data: { key: string, value: any }): void
  onQuickSelect(data: { key: string, value: any }): void
}

const FilterItem = ({ itemData, value, active, onVisibleChange, onChange, onQuickSelect }: IFilterItemProps) => {
  const {
    key,
    label,
    haveFilter,
    type,
    placeholder,
    quickSelect,
    options,
    customProps,
    emptyText = i18n.t('application:all'),
  } = itemData;
  const [filterMap, setFilterMap] = React.useState({});
  const memberSelectorRef = React.useRef(null as any);
  const [inputVal, setInputVal] = React.useState(value);
  // const inputRef = React.useRef(null);

  if (type === 'input') {
    return (
      <Input
        // autoFocus // 默认全部展示，不需要自动获取焦点
        value={inputVal}
        size='small'
        // ref={inputRef}
        prefix={<CustomIcon type='search' />}
        placeholder={placeholder || i18n.t('press enter to search')}
        // onPressEnter={() => inputRef.current?.blur()}
        onChange={(e) => setInputVal(e.target.value)}
        onPressEnter={() => onChange({ key, value: inputVal })}
      />
    );
  }

  if (type === 'select') {
    const _value = value ? (isString(value) ? [value] : value) : [];
    const _options = options || [];
    const { mode = 'multiple' } = customProps || {};
    const isSigleMode = mode === 'single';
    const valueText = _options
      .filter((a) => _value.includes(a.value))
      .map((a) => a.label)
      .join(',') || emptyText;
    const ops = (
      <Menu>
        {haveFilter && (
          [
            <Menu.Item key='search-item'>
              <Input
                autoFocus
                size="small"
                placeholder={i18n.t('common:search')}
                prefix={<CustomIcon type="search" />}
                value={filterMap[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilterMap((prev) => {
                    return {
                      ...prev,
                      [key]: v.toLowerCase(),
                    };
                  });
                }}
              />
            </Menu.Item>,
            <Menu.Divider key='divider1' />,
          ]
        )}
        {
          !isSigleMode && ( // 单选模式下不展示已选择n项
            [
              <Menu.Item key='select-info' className='flex-box not-select px6 py0'>
                <span>{i18n.t('common:selected')} {_value.length} {i18n.t('common:items')}</span>
                <span className='fake-link ml8' onClick={() => onChange({ key, value: undefined })}>{i18n.t('common:clear select')}</span>
              </Menu.Item>,
              <Menu.Divider key='divider2' />,
            ]
          )
        }
        {
          quickSelect && !isEmpty(quickSelect) ? (
            [
              <Menu.Item key='quick-select-menu-item'>
                <span className='fake-link flex-box' onClick={() => onQuickSelect({ key: quickSelect.operationKey, value: itemData })}>{quickSelect.label}</span>
              </Menu.Item>,
              <Menu.Divider key='divider3' />,
            ]
          ) : null
        }
        <Menu.Item key='options' className='pa0 options-container'>
          {_options.map((op) => {
            if (filterMap[key] && !String(op.label).toLowerCase().includes(filterMap[key])) {
              return null;
            }
            return (
              <div
                className={`option-item ${(_value || []).includes(op.value) ? 'checked-item' : ''}`}
                key={op.value}
                onClick={() => {
                  if (isSigleMode && !_value.includes(op.value)) {
                    onChange({
                      key,
                      value: op.value,
                    });
                    onVisibleChange(false);
                  } else {
                    onChange({
                      key,
                      value: _value.includes(op.value)
                        ? _value.filter((v: string | number) => v !== op.value)
                        : _value.concat(op.value),
                    });
                  }
                }}
              >
                <div className="flex-box full-width">
                  <span>{op.label}</span>
                  <span>
                    {_value.includes(op.value) ? <CustomIcon type='duigou' className='color-success ml8' /> : null}
                  </span>
                </div>
              </div>
            );
          })}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown
        trigger={['click']}
        visible={active}
        onVisibleChange={onVisibleChange}
        overlay={ops}
        overlayClassName="contractive-filter-item-dropdown"
        placement="bottomLeft"
      >
        <span className="contractive-filter-item">
          <span className="color-text-desc mr2">{label}</span>
          <span className='contractive-filter-item-value nowrap'>{valueText}</span>
          <CustomIcon type='caret-down' />
        </span>
      </Dropdown>
    );
  }

  if (type === 'dateRange') {
    const [startDate, endDate] = value || [];
    const { borderTime } = customProps || {};

    const disabledDate = (isStart: boolean) => (current: Moment | undefined) => {
      return !!current && (
        isStart
          ? (endDate ? (borderTime ? current.startOf('dates') : current) > moment(endDate) : false)
          : (startDate ? (borderTime ? current.endOf('dates') : current) < moment(startDate) : false)
      );
    };

    const getTimeValue = (v: any[]) => {
      if (borderTime) {
        const startVal = v[0] ? moment(isString(v[0]) ? +v[0] : v[0]).startOf('dates').valueOf() : v[0];
        const endVal = v[1] ? moment(isString(v[1]) ? +v[1] : v[1]).endOf('dates').valueOf() : v[1];
        return [startVal, endVal];
      }
      return v;
    };

    return (
      <span className="contractive-filter-item contractive-filter-date-picker">
        <span className="color-text-desc mr2">{label}</span>
        <DatePicker
          size='small'
          value={startDate ? moment(startDate) : undefined}
          disabledDate={disabledDate(true)}
          format={'YYYY/MM/DD'}
          onChange={(v) => onChange({ key, value: getTimeValue([v?.valueOf(), endDate]) })}
          placeholder={i18n.t('common:startDate')}
        />
        <span className="color-text-desc">{i18n.t('common:to')}</span>
        <DatePicker
          size='small'
          value={endDate ? moment(endDate) : undefined}
          disabledDate={disabledDate(false)}
          format={'YYYY/MM/DD'}
          placeholder={i18n.t('common:endDate')}
          onChange={(v) => onChange({ key, value: getTimeValue([startDate, v?.valueOf()]) })}
        />
      </span>
    );
  }

  if (type === 'memberSelector') {
    const memberResultsRender = (displayValue: any[]) => {
      const usersText = map(displayValue, d => d.label || d.value).join(',');
      return (
        <span
          className='contractive-filter-item-value nowrap member-value'
          onClick={(e) => {
            e.stopPropagation();
            if (memberSelectorRef?.current?.show) {
              memberSelectorRef.current.show();
            }
          }}
        >{usersText}
        </span>
      );
    };
    return (
      <span
        className="contractive-filter-item"
        onClick={() => {
          if (memberSelectorRef?.current?.show) {
            memberSelectorRef.current.show();
          }
        }}
      >
        <span className="color-text-desc mr2">{label}</span>
        <MemberSelector
          {...(customProps || {}) as any}
          onChange={(v) => {
            onChange({ key, value: v });
          }}
          value={value}
          ref={memberSelectorRef}
          resultsRender={memberResultsRender}
          placeholder={' '}
          className='contractive-member-selector'
          allowClear={false}
          showSearch={haveFilter}
        />
        {value ? null : <span>{emptyText}</span>}
        <CustomIcon type='caret-down' />
      </span>
    );
  }

  return null;
};

const noop = () => { };
interface ContractiveFilterProps {
  initValue?: Obj, // 初始化
  values?: Obj, // 完全受控
  conditions: ICondition[],
  delay: number,
  visible?: boolean,
  fullWidth?: boolean,
  onConditionsChange?: (data: ICondition[]) => void;
  onChange(valueMap: Obj): void
  onQuickSelect?(data: { key: string, value: any }): void
}

const setConditionShowIndex = (conditions: ICondition[], key: string, show: boolean) => {
  const showIndexArr = map(conditions, 'showIndex');
  const maxShowIndex = max(showIndexArr) as number;
  return map(conditions, item => {
    return {
      ...item,
      showIndex: key === item.key ? (show ? maxShowIndex + 1 : 0) : item.showIndex,
    };
  });
};

const getInitConditions = (conditions: ICondition[], valueMap: Obj) => {
  const showIndexArr = map(conditions, 'showIndex');
  const maxShowIndex = max(showIndexArr) as number;
  let curMax = maxShowIndex;
  const reConditions = map(conditions, item => {
    const curValue = valueMap[item.key];
    // 有值默认展示
    if ((curValue !== undefined || (isArray(curValue) && !isEmpty(curValue)))) {
      curMax += 1;
      return { ...item, showIndex: curMax };
    }
    return { ...item };
  });
  return reConditions;
};

export const ContractiveFilter = ({ initValue, values, conditions: propsConditions, delay, visible = true, onChange, onQuickSelect = noop, onConditionsChange = noop, fullWidth = false }: ContractiveFilterProps) => {
  const [conditions, setConditions] = React.useState(getInitConditions(propsConditions || [], values || initValue || {}));
  const [hideFilterKey, setHideFilterKey] = React.useState('');
  const [closeAll, setCloseAll] = React.useState(false);
  const [valueMap, setValueMap] = React.useState(values || initValue || {});
  const [activeMap, setActiveMap] = React.useState({});
  const debouncedChange = React.useRef(debounce(onChange, delay));

  const inputList = conditions.filter(a => a.type === 'input');
  const displayConditionsLen = conditions.filter(item => !item.fixed && item.type !== 'input').length;

  useUpdateEffect(() => {
    setValueMap(values || {});
  }, [values]);

  // 当从props传进来的conditions变化时调用setConditions
  React.useEffect(() => {
    const preShowIndexMap = conditions.reduce(
      (acc, x) => ({ ...acc, [x.key]: x.showIndex }),
      {}
    );
    // 记录已选中的标签项，保留已选中标签项的showIndex
    const keepShowIndexConditions = propsConditions.map((item) => ({
      ...item,
      showIndex: preShowIndexMap[item.key] || item.showIndex,
    }));

    setConditions(keepShowIndexConditions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsConditions]);

  React.useEffect(() => {
    onConditionsChange(conditions);
  }, [conditions, onConditionsChange]);

  React.useEffect(() => {
    // 控制点击外部关闭 dropdown
    const handleCloseDropdown = (e: MouseEvent) => {
      const wrappers = Array.from(
        document.querySelectorAll('.contractive-filter-item-wrap')
      );
      const dropdowns = Array.from(
        document.querySelectorAll('.contractive-filter-item-dropdown')
      );

      const datePcikers = Array.from(
        document.querySelectorAll('.contractive-filter-date-picker')
      );
      const node = e.target as Node;
      const inner = wrappers
        .concat(dropdowns)
        .some((wrap) => wrap.contains(node));
      const isDatePicker = datePcikers.some((wrap) => wrap.contains(node));

      if (!inner && isDatePicker) {
        setCloseAll(true);
      }
    };
    document.body.addEventListener('click', handleCloseDropdown);
    return () => document.body.removeEventListener('click', handleCloseDropdown);
  }, []);

  const handelItemChange = (vals: { key: string, value: any } | Obj, batchChange = false) => {
    let curValueMap = { ...valueMap };
    if (batchChange) {
      setValueMap((prev) => {
        return {
          ...prev,
          ...vals,
        };
      });
      curValueMap = { ...curValueMap, ...vals };
    } else {
      const { key, value } = vals;
      setValueMap((prev) => {
        return {
          ...prev,
          [key]: value,
        };
      });
      curValueMap = { ...curValueMap, [key]: value };
    }
    if (delay) {
      debouncedChange.current(curValueMap);
    } else {
      onChange(curValueMap);
    }
  };

  // 清除选中
  const handleClearSelected = () => {
    setConditions(prev => map(prev, pItem => {
      if (pItem.fixed || pItem.type === 'input') {
        return { ...pItem };
      } else {
        return { ...pItem, showIndex: 0 };
      }
    }));
    const newValueMap = { ...valueMap };
    map(newValueMap, (_v, _k) => {
      const curConditions = conditions[_k] || {};
      if (!(curConditions.fixed || curConditions.type === 'input')) {
        newValueMap[_k] = undefined;
      }
    });
    handelItemChange(newValueMap, true);
  };

  const showList = sortBy(conditions.filter(a => {
    const curValue = valueMap[a.key];
    // 有值默认展示
    if (a.type !== 'input' && (curValue !== undefined || (isArray(curValue) && !isEmpty(curValue)))) {
      return true;
    }
    return (a.showIndex || a.fixed) && a.type !== 'input';
  }), 'showIndex');

  return (
    <div className="contractive-filter-bar">
      {showList.map((item) => (
        <span
          className={`contractive-filter-item-wrap ${fullWidth ? 'full-width' : ''}`}
          key={item.key}
          onClick={() => {
            setCloseAll(false);
          }}
        >
          {!item.fixed && (
            <CustomIcon
              className="contractive-filter-item-close"
              type='guanbi-fill'
              onClick={() => {
                setConditions(setConditionShowIndex(conditions, item.key, false));
                if (valueMap[item.key] !== undefined) handelItemChange({ key: item.key, value: undefined });
              }}
            />
          )}
          <FilterItem
            itemData={item}
            value={valueMap[item.key]}
            active={closeAll ? false : activeMap[item.key]}
            onVisibleChange={v => setActiveMap(prev => ({ ...prev, [item.key]: v }))}
            onChange={handelItemChange}
            onQuickSelect={onQuickSelect}
          />
        </span>
      ))}

      {
        displayConditionsLen > 0 && (
          <span className={`contractive-filter-item-wrap ${fullWidth ? 'full-width' : ''}`}>
            <Dropdown
              trigger={['click']}
              overlayClassName="contractive-filter-item-dropdown"
              overlay={
                <Menu>
                  <Menu.Item className='not-select'>
                    <Input
                      autoFocus
                      size='small'
                      prefix={<CustomIcon type="search" />}
                      onClick={e => e.stopPropagation()}
                      value={hideFilterKey}
                      onChange={e => setHideFilterKey(e.target.value.toLowerCase())}
                      placeholder={i18n.t('common:Filter conditions')}
                    />
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item className='not-select px6 py0'>
                    <div className='flex-box'>
                      <span>{i18n.t('common:selected')} {showList.filter(a => a.fixed !== true).length} {i18n.t('common:items')}</span>
                      <span className='fake-link' onClick={handleClearSelected}>{i18n.t('common:clear select')}</span>
                    </div>
                  </Menu.Item>
                  <Menu.Divider />
                  {conditions.map((item) => {
                    const { key, label, fixed, type } = item;
                    if (fixed || type === 'input' || !item.label.toLowerCase().includes(hideFilterKey)) {
                      return null;
                    }
                    const handleClick = () => {
                      const haveShow = !!showList.find(a => a.key === key);
                      setConditions(setConditionShowIndex(conditions, item.key, !haveShow));
                      if (!haveShow) {
                        setCloseAll(false);
                        setActiveMap(prev => ({ ...prev, [item.key]: true }));
                      }
                    };
                    return (
                      <Menu.Item
                        key={key}
                        className='option-item'
                        onClick={handleClick}
                      >
                        <Checkbox checked={!!showList.find(a => a.key === key)} className='mr8' /> {label}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
              placement="bottomLeft"
            >
              <span className="contractive-filter-item">
                <CustomIcon type='tj1' className='fz12 mr2 color-text' />
                <span>{i18n.t('common:filter')}</span>
                <CustomIcon type='caret-down' />
              </span>
            </Dropdown>
          </span>
        )
      }

      {
        inputList.map((item) => (
          <span
            className={`contractive-filter-item-wrap ${fullWidth ? 'full-width' : ''}`}
            key={item.key}
            onClick={() => setCloseAll(false)}
          >
            <FilterItem
              itemData={item}
              value={valueMap[item.key]}
              active={closeAll ? false : activeMap[item.key]}
              onVisibleChange={v => setActiveMap(prev => ({ ...prev, [item.key]: v }))}
              onChange={handelItemChange}
              onQuickSelect={onQuickSelect}
            />
          </span>
        ))
      }
    </div>
  );
};

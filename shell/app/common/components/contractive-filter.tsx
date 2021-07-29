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
import { Menu, Dropdown, Input, DatePicker, Checkbox } from 'app/nusi';
import { Icon as CustomIcon, MemberSelector } from 'common';
import moment, { Moment } from 'moment';
import { useUpdateEffect } from 'react-use';
import './contractive-filter.scss';
import { debounce, isEmpty, isArray, map, max, sortBy, isString, has } from 'lodash';
import i18n from 'i18n';

interface Option {
  label: string;
  value: string | number;
  icon: string;
  children?: Option[];
}

type ConditionType = 'select' | 'input' | 'dateRange';

interface ICondition {
  key: string;
  label: string;
  type: ConditionType;
  emptyText?: string;
  value?: string | number | string[] | number[] | Obj;
  fixed?: boolean;
  showIndex?: number; // 0： 隐藏、其他显示
  haveFilter?: boolean;
  placeholder?: string;
  quickSelect?: {
    label: string;
    operationKey: string;
  };
  options?: Option[];
  customProps: Obj;
}

interface IFilterItemProps {
  itemData: ICondition;
  value: any;
  active: boolean;
  onVisibleChange: (visible: boolean) => void;
  onChange: (data: { key: string; value: any }, extra?: { forceChange?: boolean }) => void;
  onQuickSelect: (data: { key: string; value: any }) => void;
}

const filterMatch = (v: string, f: string) => v.toLowerCase().includes(f.toLowerCase());

const getSelectOptions = (options: Option[], filterKey: string) => {
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
    }
    curOp && useableOptions.push(curOp);
  });
  return useableOptions;
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
      className={`option-item ${(value || []).includes(option.value) ? 'checked-item' : ''}`}
      key={option.value}
      onClick={() => onClick(option)}
    >
      <div className="flex justify-between items-center w-full">
        <span>{option.label}</span>
        <span>{value.includes(option.value) ? <CustomIcon type="duigou" className="text-success ml-2" /> : null}</span>
      </div>
    </div>
  );
};

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

  const debouncedChange = React.useRef(debounce(onChange, 500));

  useUpdateEffect(() => {
    debouncedChange?.current({ key, value: inputVal }, { forceChange: true });
  }, [inputVal]);

  React.useEffect(() => {
    if (memberSelectorRef?.current?.show && active) {
      memberSelectorRef.current.show(active);
    }
  }, [active]);

  if (type === 'input') {
    return (
      <Input
        // autoFocus // 默认全部展示，不需要自动获取焦点
        value={inputVal}
        size="small"
        allowClear
        // ref={inputRef}
        prefix={<CustomIcon type="search" />}
        placeholder={placeholder || i18n.t('press enter to search')}
        // onPressEnter={() => inputRef.current?.blur()}
        onChange={(e) => setInputVal(e.target.value)}
        // onPressEnter={() => onChange({ key, value: inputVal })}
      />
    );
  }

  if (type === 'select') {
    const _value = value ? (isString(value) ? [value] : value) : [];
    const _options = options || [];
    const { mode = 'multiple' } = customProps || {};
    const isSigleMode = mode === 'single';
    const valueText =
      _options
        .reduce((_optArr: Option[], _curOpt: Option) => _optArr.concat(_curOpt.children ?? _curOpt), [])
        .filter((a) => _value.includes(a.value))
        .map((a) => a.label)
        .join(',') || emptyText;

    const useableOptions = getSelectOptions(_options, filterMap[key]);
    const ops = (
      <Menu>
        {haveFilter && [
          <Menu.Item key="search-item options-item">
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
          <Menu.Divider key="divider1" />,
        ]}
        {!isSigleMode && [
          // 单选模式下不展示已选择n项
          <Menu.Item key="select-info" className="flex justify-between items-center not-select px6 py-0 options-item">
            <span>
              {i18n.t('common:selected')} {_value.length} {i18n.t('common:items')}
            </span>
            <span className="fake-link ml-2" onClick={() => onChange({ key, value: undefined })}>
              {i18n.t('common:clear selected')}
            </span>
          </Menu.Item>,
          <Menu.Divider key="divider2" />,
        ]}
        {quickSelect && !isEmpty(quickSelect)
          ? [
              <Menu.Item key="quick-select-menu-item options-item">
                <span
                  className="fake-link flex justify-between items-center"
                  onClick={() => onQuickSelect({ key: quickSelect.operationKey, value: itemData })}
                >
                  {quickSelect.label}
                </span>
              </Menu.Item>,
              <Menu.Divider key="divider3" />,
            ]
          : null}
        <Menu.Item key="options" className="p-0 options-container options-item">
          {useableOptions.map((op) => {
            if (has(op, 'children') && !op.children?.length) {
              return null;
            }
            const isGroup = op.children?.length;
            const onClickOptItem = (_curOpt: Option) => {
              if (isSigleMode && !_value.includes(_curOpt.value)) {
                onChange({
                  key,
                  value: _curOpt.value,
                });
                onVisibleChange(false);
              } else {
                onChange({
                  key,
                  value: _value.includes(_curOpt.value)
                    ? _value.filter((v: string | number) => v !== _curOpt.value)
                    : _value.concat(_curOpt.value),
                });
              }
            };
            if (isGroup) {
              return (
                <div className="option-group" key={op.value || op.label}>
                  <div className="option-group-label">{op.label}</div>
                  {op.children?.map((cItem) => {
                    return (
                      <OptionItem
                        key={cItem.value}
                        value={_value}
                        option={cItem}
                        onClick={() => onClickOptItem(cItem)}
                      />
                    );
                  })}
                </div>
              );
            } else {
              return <OptionItem key={op.value} value={_value} option={op} onClick={() => onClickOptItem(op)} />;
            }
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
          <span className="text-desc mr-0.5">{label}</span>
          <span className="contractive-filter-item-value nowrap">{valueText}</span>
          <CustomIcon type="caret-down" />
        </span>
      </Dropdown>
    );
  }

  if (type === 'dateRange') {
    const [startDate, endDate] = value || [];
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

    const getTimeValue = (v: any[]) => {
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
      <span className="contractive-filter-item contractive-filter-date-picker">
        <span className="text-desc mr-0.5">{label}</span>
        <DatePicker
          size="small"
          value={startDate ? moment(startDate) : undefined}
          disabledDate={disabledDate(true)}
          format={'YYYY/MM/DD'}
          onChange={(v) => onChange({ key, value: getTimeValue([v?.valueOf(), endDate]) })}
          placeholder={i18n.t('common:startDate')}
        />
        <span className="text-desc">{i18n.t('common:to')}</span>
        <DatePicker
          size="small"
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
      const usersText = map(displayValue, (d) => d.label || d.value).join(',');
      return (
        <span
          className="contractive-filter-item-value nowrap member-value"
          onClick={(e) => {
            e.stopPropagation();
            onVisibleChange(true);
          }}
        >
          {usersText}
        </span>
      );
    };
    return (
      <span
        className="contractive-filter-item"
        onClick={() => {
          onVisibleChange(true);
        }}
      >
        <span className="text-desc mr-0.5">{label}</span>
        <MemberSelector
          {...((customProps || {}) as any)}
          onChange={(v) => {
            onChange({ key, value: v });
          }}
          value={value}
          dropdownMatchSelectWidth={false}
          onDropdownVisible={(vis: boolean) => onVisibleChange(vis)}
          ref={memberSelectorRef}
          resultsRender={memberResultsRender}
          placeholder={' '}
          className="contractive-member-selector"
          allowClear={false}
          showSearch={haveFilter}
        />
        {value?.length ? null : <span>{emptyText}</span>}
        <CustomIcon type="caret-down" />
      </span>
    );
  }
  return null;
};

const noop = () => {};
interface ContractiveFilterProps {
  initValue?: Obj; // 初始化
  values?: Obj; // 完全受控
  conditions: ICondition[];
  delay: number;
  visible?: boolean;
  fullWidth?: boolean;
  onConditionsChange?: (data: ICondition[]) => void;
  onChange: (valueMap: Obj) => void;
  onQuickSelect?: (data: { key: string; value: any }) => void;
}

const setConditionShowIndex = (conditions: ICondition[], key: string, show: boolean) => {
  const showIndexArr = map(conditions, 'showIndex');
  const maxShowIndex = max(showIndexArr) as number;
  return map(conditions, (item) => {
    return {
      ...item,
      showIndex: key === item.key ? (show ? (maxShowIndex || 0) + 1 : 0) : item.showIndex,
    };
  });
};

const getInitConditions = (conditions: ICondition[], valueMap: Obj) => {
  const showIndexArr = map(conditions, 'showIndex');
  const maxShowIndex = max(showIndexArr) as number;
  let curMax = maxShowIndex;
  const reConditions = map(conditions, (item) => {
    const curValue = valueMap[item.key];
    // 有值默认展示
    if (curValue !== undefined || (isArray(curValue) && !isEmpty(curValue))) {
      curMax += 1;
      return { ...item, showIndex: curMax };
    }
    return { ...item };
  });
  return reConditions;
};

export const ContractiveFilter = ({
  initValue,
  values,
  conditions: propsConditions,
  delay,
  visible = true,
  onChange,
  onQuickSelect = noop,
  onConditionsChange = noop,
  fullWidth = false,
}: ContractiveFilterProps) => {
  const [conditions, setConditions] = React.useState(
    getInitConditions(propsConditions || [], values || initValue || {}),
  );
  const [hideFilterKey, setHideFilterKey] = React.useState('');
  const [closeAll, setCloseAll] = React.useState(false);
  const [valueMap, setValueMap] = React.useState(values || initValue || {});
  const [activeMap, setActiveMap] = React.useState({});
  const debouncedChange = React.useRef(debounce(onChange, delay));

  const valueMapRef = React.useRef<Obj>();

  const inputList = conditions.filter((a) => a.type === 'input');
  const displayConditionsLen = conditions.filter((item) => !item.fixed && item.type !== 'input').length;

  useUpdateEffect(() => {
    setValueMap(values || {});
  }, [values]);

  React.useEffect(() => {
    valueMapRef.current = { ...valueMap };
  }, [valueMap]);

  // 当从props传进来的conditions变化时调用setConditions
  React.useEffect(() => {
    const preShowIndexMap = conditions.reduce((acc, x) => ({ ...acc, [x.key]: x.showIndex }), {});
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
      const wrappers = Array.from(document.querySelectorAll('.contractive-filter-item-wrap'));
      const dropdowns = Array.from(document.querySelectorAll('.contractive-filter-item-dropdown'));

      const datePcikers = Array.from(document.querySelectorAll('.contractive-filter-date-picker'));
      const node = e.target as Node;
      const inner = wrappers.concat(dropdowns).some((wrap) => wrap.contains(node));
      const isDatePicker = datePcikers.some((wrap) => wrap.contains(node));

      if (!inner && isDatePicker) {
        setCloseAll(true);
      }
    };
    document.body.addEventListener('click', handleCloseDropdown);
    return () => document.body.removeEventListener('click', handleCloseDropdown);
  }, []);

  const handelItemChange = (
    vals: { key: string; value: any } | Obj,
    extra?: { batchChange?: boolean; forceChange?: boolean },
  ) => {
    const { batchChange = false, forceChange = false } = extra || {};
    let curValueMap = valueMapRef.current;
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
    if (delay && !forceChange) {
      debouncedChange.current(curValueMap);
    } else {
      onChange(curValueMap);
    }
  };

  // 清除选中
  const handleClearSelected = () => {
    setConditions((prev) =>
      map(prev, (pItem) => {
        if (pItem.fixed || pItem.type === 'input') {
          return { ...pItem };
        } else {
          return { ...pItem, showIndex: 0 };
        }
      }),
    );
    const newValueMap = { ...valueMap };
    map(newValueMap, (_v, _k) => {
      const curConditions = conditions[_k] || {};
      if (!(curConditions.fixed || curConditions.type === 'input')) {
        newValueMap[_k] = undefined;
      }
    });
    handelItemChange(newValueMap, { batchChange: true });
  };

  const showList = sortBy(
    conditions.filter((a) => {
      const curValue = valueMap[a.key];
      // 有值默认展示
      if (a.type !== 'input' && (curValue !== undefined || (isArray(curValue) && !isEmpty(curValue)))) {
        return true;
      }
      return (a.showIndex || a.fixed) && a.type !== 'input';
    }),
    'showIndex',
  );

  return (
    <div className="contractive-filter-bar">
      {showList.map((item) => (
        <span
          className={`contractive-filter-item-wrap ${fullWidth ? 'w-full' : ''}`}
          key={item.key}
          onClick={() => {
            setCloseAll(false);
          }}
        >
          {!item.fixed && (
            <CustomIcon
              className="contractive-filter-item-close"
              type="guanbi-fill"
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
            onVisibleChange={(v) => setActiveMap((prev) => ({ ...prev, [item.key]: v }))}
            onChange={handelItemChange}
            onQuickSelect={onQuickSelect}
          />
        </span>
      ))}

      {displayConditionsLen > 0 && (
        <span className={`contractive-filter-item-wrap ${fullWidth ? 'w-full' : ''}`}>
          <Dropdown
            trigger={['click']}
            overlayClassName="contractive-filter-item-dropdown"
            overlay={
              <Menu>
                <Menu.Item className="not-select">
                  <Input
                    autoFocus
                    size="small"
                    prefix={<CustomIcon type="search" />}
                    onClick={(e) => e.stopPropagation()}
                    value={hideFilterKey}
                    onChange={(e) => setHideFilterKey(e.target.value.toLowerCase())}
                    placeholder={i18n.t('common:Filter conditions')}
                  />
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item className="not-select px6 py-0">
                  <div className="flex justify-between items-center">
                    <span>
                      {i18n.t('common:selected')} {showList.filter((a) => a.fixed !== true).length}{' '}
                      {i18n.t('common:items')}
                    </span>
                    <span className="fake-link" onClick={handleClearSelected}>
                      {i18n.t('common:clear selected')}
                    </span>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                {conditions.map((item) => {
                  const { key, label, fixed, type } = item;
                  if (fixed || type === 'input' || !item.label.toLowerCase().includes(hideFilterKey)) {
                    return null;
                  }
                  const handleClick = () => {
                    const haveShow = !!showList.find((a) => a.key === key);
                    setConditions(setConditionShowIndex(conditions, item.key, !haveShow));
                    if (!haveShow) {
                      setCloseAll(false);
                      setActiveMap((prev) => ({ ...prev, [item.key]: true }));
                    }
                  };
                  return (
                    <Menu.Item key={key} className="option-item" onClick={handleClick}>
                      <Checkbox checked={!!showList.find((a) => a.key === key)} className="mr-2" /> {label}
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
            placement="bottomLeft"
          >
            <span className="contractive-filter-item">
              <CustomIcon type="tj1" className="text-xs mr-0.5 text-normal" />
              <span>{i18n.t('common:filter')}</span>
              <CustomIcon type="caret-down" />
            </span>
          </Dropdown>
        </span>
      )}

      {inputList.map((item) => (
        <span
          className={`contractive-filter-item-wrap ${fullWidth ? 'w-full' : ''}`}
          key={item.key}
          onClick={() => setCloseAll(false)}
        >
          <FilterItem
            itemData={item}
            value={valueMap[item.key]}
            active={closeAll ? false : activeMap[item.key]}
            onVisibleChange={(v) => setActiveMap((prev) => ({ ...prev, [item.key]: v }))}
            onChange={handelItemChange}
            onQuickSelect={onQuickSelect}
          />
        </span>
      ))}
    </div>
  );
};

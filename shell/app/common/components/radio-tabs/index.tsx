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

import { Radio, Menu, Tooltip, Dropdown } from 'antd';
import React from 'react';
import { ErdaIcon } from 'common';
import { allWordsFirstLetterUpper } from 'common/utils';
import { isArray } from 'lodash';
import './index.scss';

export interface RadioTabsProps<T> {
  defaultValue?: T;
  disabled?: boolean;
  className?: string;
  options: Array<IOption<T>>;
  value?: T;
  onChange?: (v: T, o: IOption<T>) => void;
}

interface IOption<T> {
  label: string | React.ReactElement;
  value: T;
  disabled?: boolean;
  icon?: string;
  tip?: string;
  children?: Array<IOption<T>>;
}

const RadioTabs = <T extends string | number>(props: RadioTabsProps<T>) => {
  const { options, value: propsValue, defaultValue, onChange, className = '', ...rest } = props;
  const RadioItem = Radio.Button;

  const [value, setValue] = React.useState(propsValue || defaultValue);
  const [subValues, setSubValues] = React.useState<Obj<T>>({});

  React.useEffect(() => {
    propsValue && setValue((prev) => (prev !== propsValue ? propsValue : prev));
  }, [propsValue]);

  const convertValue = (val?: T) => {
    if (val === undefined) return val;
    if (options.find((o) => o.value === val)) {
      return val;
    } else {
      let reVal = val;
      options.forEach((o) => {
        if (o.children?.find((oc) => oc.value === val)) {
          reVal = o.value;
        }
      });
      return reVal;
    }
  };

  const valueHandle = (v: T): [T, IOption<T>] => {
    let curVal = v;
    const curOption = options.find((o) => o.value === curVal) as IOption<T>;
    if (curOption?.children?.length) {
      curVal = subValues[curOption.value];
    }
    return [curVal, curOption];
  };
  return (
    <Radio.Group
      buttonStyle="solid"
      {...rest}
      className={`erda-radio-tabs ${className}`}
      size="middle"
      value={convertValue(value)}
      onChange={(e) => {
        const [curVal, curOption] = valueHandle(e.target.value);
        propsValue === undefined && setValue(curVal);
        onChange?.(curVal, curOption);
      }}
    >
      {options.map((mItem) => {
        const { children, value: itemValue, icon, disabled, label, tip } = mItem;

        if (isArray(children) && children.length) {
          const sv = subValues[itemValue] || children[0].value;
          const child = children.find((c) => c.value === sv) as IOption<T>;
          const getMenu = () => {
            return (
              <Menu
                onClick={(e) => {
                  propsValue === undefined && setValue(e.key as T);
                  setSubValues((prev) => ({ ...prev, [itemValue]: e.key } as Obj<T>));
                  onChange?.(e.key as T, child);
                }}
              >
                {children.map((g) => {
                  return (
                    <Menu.Item className={`${sv === g.value ? 'text-primary bg-default-06' : ''}`} key={g.value}>
                      {allWordsFirstLetterUpper(g.label)}
                    </Menu.Item>
                  );
                })}
              </Menu>
            );
          };
          return (
            <Tooltip key={itemValue} title={tip}>
              <Dropdown overlay={getMenu()}>
                <RadioItem value={itemValue} key={itemValue} disabled={disabled}>
                  <div className="inline-flex justify-between items-center">
                    {icon ? <ErdaIcon size={18} type={icon} className="mr-1" /> : null}
                    <span className="nowrap">{allWordsFirstLetterUpper(child?.label)}</span>
                    <ErdaIcon size="18" type="caret-down" className="ml-1" />
                  </div>
                </RadioItem>
              </Dropdown>
            </Tooltip>
          );
        } else {
          return (
            <Tooltip key={itemValue} title={tip}>
              <RadioItem value={itemValue} key={itemValue} disabled={disabled}>
                <div className="flex justify-between items-center">
                  {icon ? <ErdaIcon size={18} type={icon} className="mr-1" /> : null}
                  {allWordsFirstLetterUpper(label)}
                </div>
              </RadioItem>
            </Tooltip>
          );
        }
      })}
    </Radio.Group>
  );
};

export default RadioTabs;

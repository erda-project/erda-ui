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
import { isArray } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import './index.scss';

export interface RadioTabsProps {
  defaultValue?: Value;
  disabled?: boolean;
  className?: string;
  options: IOption[];
  value?: Value;
  onChange?: (v: Value, o: IOption) => void;
}

type Value = string | number;

interface IOption {
  label: string | React.ReactElement;
  value: string | number;
  disabled?: boolean;
  icon?: string;
  tip?: string;
  children?: IOption[];
}

const RadioTabs = (props: RadioTabsProps) => {
  const { options, value: propsValue, defaultValue, onChange, className = '', ...rest } = props;
  const RadioItem = Radio.Button;

  const [{ value, subValues }, updater, update] = useUpdate({
    value: propsValue || defaultValue,
    subValues: {},
  });

  React.useEffect(() => {
    propsValue && updater.value((prev: string) => (prev !== propsValue ? propsValue : prev));
  }, [propsValue, updater]);

  const convertValue = (val?: Value) => {
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

  const valueHandle = (v: Value): [Value, IOption] => {
    let curVal = v;
    const curOption = options.find((o) => o.value === curVal) as IOption;
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
        updater.value(curVal);
        onChange?.(curVal, curOption);
      }}
    >
      {options.map((mItem) => {
        const { children, value: itemValue, icon, disabled, label, tip } = mItem;

        if (isArray(children) && children.length) {
          const sv = subValues[itemValue] || children[0].value;
          const child = children.find((c) => c.value === sv);
          const getMenu = () => {
            return (
              <Menu
                onClick={(e) => {
                  update({
                    value: e.key,
                    subValues: { ...subValues, [itemValue]: e.key },
                  });
                  onChange?.(e.key, child);
                }}
              >
                {children.map((g) => {
                  return (
                    <Menu.Item className={`${sv === g.value ? 'text-primary bg-default-06' : ''}`} key={g.value}>
                      {g.label}
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
                    <span className="nowrap">{child?.label}</span>
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
                  {label}
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

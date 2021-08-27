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
import { Input } from 'core/nusi';
import { Search as IconSearch } from '@icon-park/react';
import i18n from 'i18n';
import { debounce } from 'lodash';
import { Icon as CustomIcon } from 'common';
import './tiled-filter.scss';

export interface IOption {
  value: string;
  label: string;
}

export interface IField {
  type: 'input' | 'select';
  multiple?: boolean;
  label: string;
  key: string;
  placeholder?: string;
  options: IOption[];
}

export interface IProps {
  fields: IField[];
  value: Object;
  delay?: number;
  expand?: boolean;
  labelWidth?: number;
  onChange: (fullValue: Object, value?: Object) => void;
}

const TiledFilter = (props: IProps) => {
  const { fields, delay = 1000, value: propsValue, onChange, expand: propsExpand = true, labelWidth } = props;
  const [expand, setExpand] = React.useState(propsExpand);
  const [value, setValue] = React.useState(propsValue || {});
  React.useEffect(() => {
    setExpand(propsExpand);
  }, [propsExpand]);

  const debouncedChange = React.useRef(debounce(onChange, delay));
  const debouncedInputChange = React.useRef(debounce(onChange, 500));

  const inputFields: IField[] = [];
  const selectFields: IField[] = [];
  fields.forEach((field) => {
    if (field.type === 'input') {
      inputFields.push(field);
    } else if (field.type === 'select') {
      selectFields.push(field);
    }
  });

  const onChangeItem = (val: string, field: IField) => {
    const curValue = value[field.key];
    if (field.multiple) {
      setValue((prevV) => {
        const curChangeVal = curValue?.includes(val)
          ? curValue.filter((vItem: string) => vItem !== val)
          : (curValue || []).concat(val);
        const newVal = { ...prevV, [field.key]: curChangeVal };
        debouncedChange.current(newVal, { [field.key]: curChangeVal });
        return newVal;
      });
    } else {
      setValue((prevV) => {
        const curChangeVal = curValue === val ? undefined : val;
        const newVal = { ...prevV, [field.key]: curChangeVal };
        debouncedChange.current(newVal, { [field.key]: curChangeVal });
        return newVal;
      });
    }
  };

  const onChangeInputItem = (val: string, field: IField) => {
    setValue((prevV) => {
      const newVal = { ...prevV, [field.key]: val };
      debouncedInputChange.current(newVal, { [field.key]: val });
      return newVal;
    });
  };

  const clearSelect = () => {
    const newVal = {};
    selectFields.forEach((sItem) => {
      newVal[sItem.key] = undefined;
    });
    setValue((prev) => {
      debouncedChange.current({ ...prev, ...newVal }, { ...newVal });
      return { ...prev, ...newVal };
    });
  };

  const getValueLength = () => {
    let valLength = 0;
    selectFields.forEach((sItem) => {
      const curVal = value[sItem.key];
      if (!((Array.isArray(curVal) && curVal.length === 0) || curVal === undefined)) {
        valLength += 1;
      }
    });
    return valLength;
  };

  const curValLength = getValueLength();
  return (
    <div className="tiled-filter">
      <div className={`tiled-fields ${expand ? '' : 'no-expand'}`}>
        {selectFields.map((item) => {
          return (
            <div className="tiled-fields-item flex" key={item.key}>
              <div className="tiled-fields-item-label text-right pr-2 " style={{ width: labelWidth || 120 }}>
                {item.label}
              </div>
              <div className="tiled-fields-item-option flex-1">
                {item.options.map((option) => (
                  <span
                    key={option.value}
                    className={`tiled-fields-option-item ${
                      value[item.key]?.includes(option.value) ? 'chosen-item' : ''
                    }`}
                    onClick={() => onChangeItem(option.value, item)}
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {curValLength ? (
            <>
              <span>{`${i18n.t('selected {xx}', { xx: `${curValLength}${i18n.t('common:items')}` })}`}</span>
              <span className="fake-link ml-2 mr-4" onClick={clearSelect}>
                {i18n.t('common:clear selected')}
              </span>
            </>
          ) : null}
          <div className="tiled-input">
            {inputFields.map((inputItem) => {
              return (
                <Input
                  className={'tiled-input-item'}
                  key={inputItem.key}
                  value={value[inputItem.key]}
                  size="small"
                  allowClear
                  prefix={<IconSearch size="16" />}
                  placeholder={inputItem.placeholder || i18n.t('press enter to search')}
                  onChange={(e) => onChangeInputItem(e.target.value, inputItem)}
                />
              );
            })}
          </div>
        </div>
        <div className={`flex items-center expand-area`} onClick={() => setExpand(!expand)}>
          <span className="mr-2">{expand ? i18n.t('fold') : i18n.t('expand')}</span>
          <CustomIcon type="chevron-down" className={`expand-icon ${expand ? 'expand' : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default TiledFilter;

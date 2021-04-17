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

import { Input, Select } from 'app/nusi';
import React from 'react';
import { SelectProps, SelectValue, InputProps } from 'core/common/interface';

import './select-input-group.scss';

interface IState {
  inputValue?: string;
  selectValue?: SelectValue;
}

interface IProps {
  defaultSelectValue?: SelectValue;
  selectProps?: SelectProps;
  inputProps?: InputProps,
  selectTip?: string;
  inputTip?: string;
  options: Array<{
    value: string | number;
    name: string;
  }>
  value?: IState

  onChange?(data: { inputValue?: string; selectValue?: SelectValue }): void;
}

const { Option } = Select;

const SelectInputGroup = (props: IProps) => {
  const { defaultSelectValue, selectProps, selectTip, options, inputProps, inputTip = '', onChange, value } = props;
  const [state, setState] = React.useState<IState>({
    selectValue: props.defaultSelectValue,
    inputValue: undefined,
  });
  React.useEffect(() => {
    if (value) {
      const { inputValue, selectValue } = value;
      setState({
        inputValue,
        selectValue: selectValue || defaultSelectValue,
      });
    }
  }, [defaultSelectValue, value]);

  const triggerChange = (changedValue: IState) => {
    if (onChange) {
      onChange(Object.assign({}, state, changedValue));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!('value' in props)) {
      setState(pre => {
        return {
          ...pre,
          inputValue,
        };
      });
    }
    triggerChange({ inputValue });
  };


  const handleSelectChange = (selectValue: SelectValue) => {
    if (!('value' in props)) {
      setState(pre => {
        return {
          ...pre,
          selectValue,
        };
      });
    }
    triggerChange({ selectValue });
  };
  return (
    <span className="select-input-group">
      <Select
        value={state.selectValue || defaultSelectValue}
        onChange={handleSelectChange}
        placeholder={selectTip}
        {...selectProps}
      >
        {
          options.map(op => <Option key={op.value} value={op.value}>{op.name}</Option>)
        }
      </Select>
      <span className="slash">/</span>
      <Input
        type="text"
        value={state.inputValue}
        onChange={handleInputChange}
        placeholder={inputTip}
        {...inputProps}
      />
    </span>
  );
};
export default SelectInputGroup;

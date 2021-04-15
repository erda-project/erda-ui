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

import './select-input-group.scss';

const { Option } = Select;

class SelectInputGroup extends React.Component {
  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      inputValue: value.inputValue,
      selectValue: value.selectValue || props.defaultSelectValue,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps && nextProps.value) {
      const { inputValue, selectValue } = nextProps.value;
      this.setState({
        inputValue,
        selectValue: selectValue || nextProps.defaultSelectValue,
      });
    }
  }

  handleSelectChange = (selectValue) => {
    if (!('value' in this.props)) {
      this.setState({ selectValue });
    }
    this.triggerChange({ selectValue });
  };

  handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (!('value' in this.props)) {
      this.setState({ inputValue });
    }
    this.triggerChange({ inputValue });
  };

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { selectProps = {}, inputProps = {}, options = [], selectTip = '', inputTip = '', defaultSelectValue } = this.props;
    const { state } = this;
    return (
      <span className="select-input-group">
        <Select
          value={state.selectValue || defaultSelectValue}
          onChange={this.handleSelectChange}
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
          onChange={this.handleInputChange}
          placeholder={inputTip}
          {...inputProps}
        />
      </span>
    );
  }
}

export default SelectInputGroup;

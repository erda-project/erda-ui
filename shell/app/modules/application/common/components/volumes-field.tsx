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

import React, { PureComponent } from 'react';
import { Icon, Input, Select } from 'app/nusi';
import { isEqual } from 'lodash';
import i18n from 'i18n';
import './variable-input-group.scss';

const { Option } = Select;

interface IVariableInputGroupProps {
  value: any[];
  required?: boolean;
  label?: string;
  placeholder?: string;
  onChange: (options: any[]) => void;
}

interface IItem {
  name: string;
  type: string;
  path: string;
}

const defaultValue: IItem[] = [];

export default class extends PureComponent<IVariableInputGroupProps, any> {
  public state = {
    value: defaultValue,
  };

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (!isEqual(nextProps.value, prevState.value)) {
      return {
        value: nextProps.value || defaultValue,
      };
    }
    return prevState;
  }

  public triggerChange = (changedValue: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  public render() {
    const { required, label } = this.props;
    return (
      <div>
        <div className="global-input-form-title">
          {required ? <span className="ant-form-item-required" /> : null}
          {label}：
          <Icon className="variable-icon" type="plus" onClick={this.addNewItem} />
        </div>
        {this.renderItem()}
      </div>
    );
  }

  private renderItem() {
    const { value } = this.state;

    return value.map((item: IItem, index: number) => {
      return (
        <div key={`volumes-${String(index)}`}>
          <div>
            <span className="edit-service-label">{i18n.t('application:directory name')}: </span>
            <span>
              <Input
                onChange={(e: any) => this.changeValue(e, 'name', index)}
                defaultValue={item.name}
                placeholder={i18n.t('application:please enter a directory name')}
              />
            </span>
          </div>
          <div>
            <span className="edit-service-label">{i18n.t('type')}: </span>
            <span>
              <Select
                onChange={(e: any) => this.changeValue(e, 'type', index)}
                defaultValue={item.type}
                placeholder={i18n.t('application:please choose the type')}
              >
                <Option value="glusterfs">glusterfs</Option>
              </Select>
            </span>
          </div>
          <div>
            <span className="edit-service-label">{i18n.t('application:parent directory')}: </span>
            <span>
              <Input
                onChange={(e: any) => this.changeValue(e, 'path', index)}
                defaultValue={item.path}
                placeholder={i18n.t('application:please enter the parent directory')}
              />
            </span>
          </div>
        </div>
      );
    });
  }

  private addNewItem = () => {
    const { value } = this.state;

    value.push({
      name: '',
      type: '',
      path: '',
    });

    this.triggerChange(value);
  };

  private changeValue = (v: any, key: string, index: number) => {
    const { value } = this.state;
    // @ts-ignore
    value[index][key] = v;
    this.triggerChange(value);
  };
}

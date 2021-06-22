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
import { Input, InputNumber, Select } from 'app/nusi';
import i18n from 'i18n';
import './variable-input-group.scss';

const { Option } = Select;

interface IVariableInputGroupProps {
  value: any;
  placeholder?: string;
  disabled?: boolean;
  onChange: (options: any[]) => void;
}

const defaultValue = {
  healthCheckKey: null,
};

export default class extends PureComponent<IVariableInputGroupProps, any> {
  constructor(props: IVariableInputGroupProps) {
    super(props);
    const keys = Object.keys(props.value);
    let healthCheckKey;
    if (keys.length) {
      healthCheckKey = keys[0];
    }
    this.state = {
      healthCheckKey,
      value: props.value || defaultValue,
    };
  }

  static getDerivedStateFromProps(nextProps: IVariableInputGroupProps) {
    const keys = Object.keys(nextProps.value);
    let healthCheckKey;
    if (keys.length) {
      healthCheckKey = keys[0];
    }
    return {
      healthCheckKey,
      value: nextProps.value || defaultValue,
    };
  }

  triggerChange = (changedValue: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { disabled } = this.props;
    const { healthCheckKey } = this.state;

    let content = null;
    switch (healthCheckKey) {
      case 'http':
        content = this.renderHttp();
        break;
      case 'exec':
        content = this.renderCommand();
        break;
      default:
        break;
    }
    return (
      <div>
        <div>
          <span className="edit-service-label">{i18n.t('application:health check mechanism')}: </span>
          <span>
            <Select disabled={disabled} value={healthCheckKey} onChange={(e: any) => this.changeValue(e, 'key')}>
              <Option value="http">HTTP</Option>
              <Option value="exec">COMMAND</Option>
            </Select>
          </span>
        </div>
        {content}
      </div>
    );
  }

  private renderHttp = () => {
    const { disabled } = this.props;
    const { value, healthCheckKey } = this.state;
    return (
      <div>
        <div>
          <span className="edit-service-label">{i18n.t('application:port')}: </span>
          <span>
            <InputNumber
              disabled={disabled}
              min={1}
              className="w-full"
              value={value[healthCheckKey] ? value[healthCheckKey].port : null}
              onChange={(v?: number) => this.changeValue(v, 'port')}
              placeholder={i18n.t('application:please enter the port')}
            />
          </span>
        </div>
        <div>
          <span className="edit-service-label">URI {i18n.t('application:path')}: </span>
          <span>
            <Input
              disabled={disabled}
              value={value[healthCheckKey] ? value[healthCheckKey].path : null}
              onChange={(e: any) => this.changeValue(e.target.value, 'path')}
              placeholder={i18n.t('application:please enter the path')}
            />
          </span>
        </div>
        <div>
          <span className="edit-service-label">{i18n.t('application:duration')}: </span>
          <span>
            <InputNumber
              disabled={disabled}
              className="w-full"
              value={value[healthCheckKey] ? value[healthCheckKey].duration || 0 : 0}
              onChange={(v?: number) => this.changeValue(v, 'duration')}
              placeholder={i18n.t('application:please enter the duration')}
              min={1}
              formatter={(v: any) => `${v}秒`}
              parser={(v: any) => v.replace('秒', '')}
            />
          </span>
        </div>
      </div>
    );
  };

  private renderCommand = () => {
    const { disabled } = this.props;
    const { value, healthCheckKey } = this.state;
    return (
      <div>
        <div>
          <span className="edit-service-label">{i18n.t('application:command')}: </span>
          <span>
            <Input
              disabled={disabled}
              value={value[healthCheckKey] ? value[healthCheckKey].cmd : null}
              onChange={(e: any) => this.changeValue(e.target.value, 'cmd')}
              placeholder={i18n.t('application:please enter the command')}
            />
          </span>
        </div>
        <div>
          <span className="edit-service-label">{i18n.t('application:duration')}: </span>
          <span>
            <InputNumber
              disabled={disabled}
              className="w-full"
              value={value[healthCheckKey] ? value[healthCheckKey].duration || 0 : null}
              onChange={(v?: number) => this.changeValue(v, 'duration')}
              placeholder={i18n.t('application:please enter the duration')}
              min={1}
              formatter={(v: any) => `${v}秒`}
              parser={(v: any) => v.replace('秒', '')}
            />
          </span>
        </div>
      </div>
    );
  };

  private changeValue = (v: any, key: string) => {
    const { value } = this.state;
    let { healthCheckKey } = this.state;
    if (key === 'key') {
      healthCheckKey = v;
      value[healthCheckKey] = {};
    } else {
      if (!value[healthCheckKey]) {
        value[healthCheckKey] = {};
      }
      // @ts-ignore
      value[healthCheckKey][key] = v;
    }
    const state = {
      healthCheckKey,
      value,
    };
    this.triggerChange(state.value);
  };
}

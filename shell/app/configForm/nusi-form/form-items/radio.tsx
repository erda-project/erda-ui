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

import { Form, Radio } from 'app/nusi';
import * as React from 'react';
import { get, map, isEmpty } from 'lodash';
import { getLabel, noop } from './common';
import { commonFields, checkWhen } from './common/config';
import i18n from 'i18n';
import './radio.scss';

const FormItem = Form.Item;

export const FormRadio = ({
  fixOut = noop,
  fixIn = noop,
  extensionFix,
  requiredCheck,
  trigger = 'onChange',
}: any = {}) =>
  React.memo(({ fieldConfig, form }: any = {}) => {
    const {
      key,
      value,
      label,
      visible,
      valid = [],
      disabled,
      required,
      dataSource,
      registerRequiredCheck = noop,
      componentProps,
      wrapperProps,
      labelTip,
      fixIn: itemFixIn,
      fixOut: itemFixOut,
      requiredCheck: _requiredCheck,
    } = fieldConfig || {};

    const curFixIn = itemFixIn || fixIn;
    const curFixOut = itemFixOut || fixOut;

    registerRequiredCheck(_requiredCheck || requiredCheck);
    const handleChange = (e: any) => {
      form.setFieldValue(key, curFixOut(e.target.value));
      (componentProps.onChange || noop)(e);
    };

    const { radioType, options: cOptions, displayDesc } = componentProps;
    const RadioItem = radioType === 'button' ? Radio.Button : Radio;
    const options = cOptions || get(dataSource, 'static') || [];

    const renderOptions = () => {
      if (typeof options === 'function') {
        return options();
      }

      if (isEmpty(options)) {
        return <div>?????????????????????</div>;
      }

      if (displayDesc) {
        return map(options, (item: any) => (
          <div className="form-item-radio">
            <RadioItem key={item.value} value={item.value}>
              {item.name}
              <div className="form-item-desc">{item.desc}</div>
            </RadioItem>
          </div>
        ));
      }

      return map(options, (item: any) => (
        <RadioItem key={item.value} value={item.value}>
          {item.name}
        </RadioItem>
      ));
    };

    return (
      <FormItem
        colon
        label={getLabel(label, labelTip)}
        className={visible ? '' : 'hide'}
        validateStatus={valid[0]}
        help={valid[1]}
        required={required}
        {...wrapperProps}
      >
        <Radio.Group id={key} {...componentProps} disabled={disabled} value={curFixIn(value)} onChange={handleChange}>
          {renderOptions()}
        </Radio.Group>
      </FormItem>
    );
  });

export const config = {
  name: 'radio',
  Component: FormRadio, // ???React?????????props????????????value???onChange
  requiredCheck: (value) => {
    // ???????????????????????????????????????
    return [value !== undefined && value !== '', i18n.t('can not be empty')];
  },
  fixOut: (value, options) => {
    // ??????????????????????????????React?????????value???????????????????????????
    return value;
  },
  fixIn: (value, options) => {
    // ???schema???React??????????????????????????????React?????????value
    return value;
  },
  extensionFix: (data, options) => {
    // ???schema???React??????????????????????????????React??????????????????
    return data;
  },
};

export const formConfig = {
  radio: {
    name: '??????',
    value: 'radio',
    fieldConfig: {
      basic: {
        key: 'basic',
        name: '????????????',
        fields: [...commonFields, ...checkWhen],
      },
      componentProps: {
        key: 'componentProps',
        name: '????????????',
        fields: [
          {
            label: '????????????',
            key: 'componentProps.radioType',
            type: 'radio',
            component: 'radio',
            defaultValue: 'radio',
            dataSource: {
              static: [
                { name: '?????????', value: 'radio' },
                { name: '????????????', value: 'button' },
              ],
            },
          },
          {
            label: '????????????',
            key: 'componentProps.displayDesc',
            type: 'switch',
            component: 'switch',
          },
          {
            label: '??????',
            key: 'dataSource.static',
            type: 'dataStatic',
            component: 'dataStatic',
          },
        ],
      },
    },
  },
};

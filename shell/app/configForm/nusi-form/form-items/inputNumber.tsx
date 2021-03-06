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

import { Form, InputNumber } from 'app/nusi';
import * as React from 'react';
import { getLabel, noop } from './common';
import i18n from 'i18n';
import { commonFields, rulesField, checkWhen } from './common/config';

const FormItem = Form.Item;

export const FormInputNumber = ({
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
    const handleChange = (val: any) => {
      form.setFieldValue(key, curFixOut(val));
      (componentProps.onChange || noop)(val);
    };

    const { placeholder } = componentProps || {};
    const _placeholder = placeholder || i18n.t('please enter {name}', { name: label });
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
        <InputNumber
          id={key}
          {...componentProps}
          disabled={disabled}
          placeholder={_placeholder}
          value={curFixIn(value)}
          onChange={handleChange}
        />
      </FormItem>
    );
  });

export const config = {
  name: 'inputNumber',
  Component: FormInputNumber, // ???React?????????props????????????value???onChange
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
  inputNumber: {
    name: '???????????????',
    value: 'inputNumber',
    fieldConfig: {
      basic: {
        key: 'basic',
        name: '????????????',
        fields: [...commonFields, rulesField, ...checkWhen],
      },
      componentProps: {
        key: 'componentProps',
        name: '????????????',
        fields: [
          {
            label: 'placeholder',
            key: 'componentProps.placeholder',
            type: 'input',
            component: 'input',
          },
          {
            label: '?????????',
            key: 'componentProps.min',
            type: 'inputNumber',
            component: 'inputNumber',
          },
          {
            label: '?????????',
            key: 'componentProps.max',
            type: 'inputNumber',
            component: 'inputNumber',
          },
          {
            label: '????????????',
            key: 'componentProps.precision',
            type: 'inputNumber',
            component: 'inputNumber',
          },
          {
            label: '??????????????????',
            key: 'componentProps.step',
            type: 'inputNumber',
            component: 'inputNumber',
          },
        ],
      },
    },
  },
};

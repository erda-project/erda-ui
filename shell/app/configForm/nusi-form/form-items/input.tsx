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

import { Form, Input } from 'app/nusi';
import * as React from 'react';
import { getLabel, noop } from './common';
import { commonFields, rulesField, checkWhen } from './common/config';
import i18n from 'i18n';

const FormItem = Form.Item;

export const FormInput = ({
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
      isPassword = false,
      fixIn: itemFixIn,
      fixOut: itemFixOut,
      requiredCheck: _requiredCheck,
    } = fieldConfig || {};
    registerRequiredCheck(_requiredCheck || requiredCheck);

    const curFixIn = itemFixIn || fixIn;
    const curFixOut = itemFixOut || fixOut;
    const handleChange = (e: any) => {
      form.setFieldValue(key, curFixOut(e.target.value));
      (componentProps.onChange || noop)(e);
    };
    const Comp = isPassword ? Input.Password : Input;
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
        <Comp
          id={key}
          {...componentProps}
          placeholder={_placeholder}
          disabled={disabled}
          value={curFixIn(value)}
          onChange={handleChange}
        />
      </FormItem>
    );
  });

export const config = {
  name: 'input',
  Component: FormInput, // ???React?????????props????????????value???onChange
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
  input: {
    name: '?????????',
    value: 'input',
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
            label: '????????????',
            key: 'componentProps.maxLength',
            type: 'inputNumber',
            component: 'inputNumber',
            componentProps: {
              min: 0,
            },
          },
          {
            label: '????????????',
            key: 'componentProps.addonAfter',
            type: 'input',
            component: 'input',
          },
          {
            label: '????????????',
            key: 'componentProps.addonBefore',
            type: 'input',
            component: 'input',
          },
          {
            label: '??????',
            key: 'componentProps.prefix',
            type: 'input',
            component: 'input',
          },
          {
            label: '??????',
            key: 'componentProps.suffix',
            type: 'input',
            component: 'input',
          },
        ],
      },
    },
  },
};

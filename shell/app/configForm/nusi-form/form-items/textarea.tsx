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
const { TextArea } = Input;

export const FormTextArea = ({
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
    const handleChange = (e: any) => {
      form.setFieldValue(key, curFixOut(e.target.value));
      (componentProps.onChange || noop)(e);
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
        <TextArea
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
  name: 'textarea',
  Component: FormTextArea, // ???React?????????props????????????value???onChange
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
  textarea: {
    name: '????????????',
    value: 'textarea',
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
            label: '?????????????????????',
            key: 'componentProps.autoSize',
            type: 'switch',
            component: 'switch',
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
            key: 'componentProps.autoSize.minRows',
            type: 'inputNumber',
            component: 'inputNumber',
            defaultValue: 2,
            componentProps: {
              min: 1,
            },
          },
          {
            label: '????????????',
            key: 'componentProps.autoSize.maxRows',
            type: 'inputNumber',
            component: 'inputNumber',
            defaultValue: 4,
            componentProps: {
              min: 1,
            },
          },
        ],
      },
    },
  },
};

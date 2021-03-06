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

import { Form, Switch } from 'app/nusi';
import * as React from 'react';
import { getLabel, noop } from './common';
import { commonFields, checkWhen } from './common/config';
import i18n from 'i18n';

const FormItem = Form.Item;

export const FormSwitch = ({ fixOut = noop, fixIn = noop, extensionFix, requiredCheck, trigger = 'onChange' }) =>
  React.memo(({ fieldConfig, form }: any) => {
    const {
      key,
      value,
      label,
      visible,
      valid,
      disabled,
      registerRequiredCheck,
      componentProps,
      required,
      wrapperProps,
      labelTip,
      fixIn: itemFixIn,
      fixOut: itemFixOut,
      requiredCheck: _requiredCheck,
    } = fieldConfig;
    const curFixIn = itemFixIn || fixIn;
    const curFixOut = itemFixOut || fixOut;

    registerRequiredCheck(_requiredCheck || requiredCheck);
    const handleChange = (val) => {
      form.setFieldValue(key, curFixOut(val));
      (componentProps.onChange || noop)(val);
    };
    return (
      <FormItem
        colon
        label={getLabel(label, labelTip)}
        // hasFeedback
        className={visible ? '' : 'hide'}
        validateStatus={valid[0]}
        help={valid[1]}
        required={required}
        {...wrapperProps}
      >
        <Switch {...componentProps} disabled={disabled} checked={!!curFixIn(value)} onChange={handleChange} />
      </FormItem>
    );
  });

export const config = {
  name: 'switch',
  Component: FormSwitch, // ???React?????????props????????????value???onChange
  requiredCheck: (value) => {
    // ???????????????????????????????????????
    return [value !== undefined, i18n.t('can not be empty')];
  },
  fixOut: (value, options) => {
    // ??????????????????????????????React?????????value???????????????????????????
    return value;
  },
  fixIn: (value = '', options) => {
    // ???schema???React??????????????????????????????React?????????value
    return value;
  },
  extensionFix: (data, options) => {
    // ???schema???React??????????????????????????????React??????????????????
    return data;
  },
  // event: { // ?????????????????????eventName???????????????React??????????????????
  //   eventName: {
  //     handleName: 'onFocus',
  //   },
  // },
};

export const formConfig = {
  switch: {
    name: '??????',
    value: 'switch',
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
            label: '???????????????',
            key: 'componentProps.checkedChildren',
            type: 'input',
            component: 'input',
          },
          {
            label: '??????????????????',
            key: 'componentProps.unCheckedChildren',
            type: 'input',
            component: 'input',
          },
        ],
      },
    },
  },
};

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

import { Form } from 'app/nusi';
import { MemberSelector } from 'common';
import * as React from 'react';
import { isEmpty } from 'lodash';
import { commonFields, rulesField, checkWhen } from 'app/configForm/nusi-form/form-items';
import i18n from 'i18n';

const FormItem = Form.Item;
const noop = (a: any) => a;
export const FormMemberSelector = ({
  fixOut = noop,
  fixIn = noop,
  extensionFix,
  requiredCheck,
  trigger = 'onChange',
}: any = {}) =>
  React.memo(({ fieldConfig, form, getLabel }: any = {}) => {
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
      requiredCheck: _requiredCheck,
    } = fieldConfig || {};
    registerRequiredCheck(_requiredCheck || requiredCheck);
    const handleChange = (e: any) => {
      form.setFieldValue(key, fixOut(e));
      (componentProps.onChange || noop)(e);
    };
    const { scopeType, type } = componentProps;
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
        <MemberSelector
          key={`${scopeType}-${type}`}
          id={key}
          {...componentProps}
          disabled={disabled}
          value={fixIn(value)}
          onChange={handleChange}
        />
      </FormItem>
    );
  });

export const config = {
  name: 'memberSelector',
  Component: FormMemberSelector, // ???React?????????props????????????value???onChange
  requiredCheck: (value) => {
    // ???????????????????????????????????????
    const invalid = Array.isArray(value) ? !isEmpty(value) : value !== undefined && value !== '';
    return [invalid, i18n.t('can not be empty')];
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
  memberSelector: {
    name: '????????????',
    value: 'memberSelector',
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
            label: 'scope',
            key: 'componentProps.scopeType',
            type: 'select',
            component: 'select',
            defaultValue: 'org',
            labelTip: 'scope????????????????????????????????????',
            dataSource: {
              static: [
                { name: 'org', value: 'org' },
                { name: 'project', value: 'project' },
                { name: 'app', value: 'app' },
                { name: 'publisher', value: 'publisher' },
              ],
            },
          },
          {
            label: '??????',
            key: 'componentProps.type',
            type: 'select',
            component: 'select',
            dataSource: {
              static: [
                { name: 'Category', value: 'Category' },
                { name: 'Normal', value: 'Normal' },
              ],
            },
          },
          {
            label: '????????????',
            key: 'componentProps.mode',
            type: 'radio',
            component: 'radio',
            dataSource: {
              static: [
                { name: '??????', value: 'multiple' },
                { name: '??????', value: undefined },
              ],
            },
          },
        ],
      },
    },
  },
};

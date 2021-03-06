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

import { Form, DatePicker } from 'app/nusi';
import * as React from 'react';
import { isEmpty, isArray, isString } from 'lodash';
import { getLabel, noop } from './common';
import { commonFields, checkWhen } from './common/config';
import i18n from 'i18n';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const FormItem = Form.Item;

const CompMap = {
  date: DatePicker,
  month: MonthPicker,
  range: RangePicker,
  week: WeekPicker,
};

const DatePickerComp = (props: any) => {
  const { componentProps, id, disabled, fixIn, handleChange, value } = props;
  const { dateType = 'date', placeholder, ...restCompProps } = componentProps || {};
  const Comp = CompMap[dateType];

  const plcholder = dateType === 'range' && isString(placeholder) ? placeholder.split(',') : placeholder;
  return (
    <Comp
      id={id}
      key={dateType}
      placeholder={plcholder}
      {...restCompProps}
      disabled={disabled}
      value={fixIn(value, { dateType })}
      onChange={handleChange}
    />
  );
};

export const FormDatePicker = ({
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
      form.setFieldValue(key, curFixOut(e));
      (componentProps.onChange || noop)(e);
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
        <DatePickerComp
          componentProps={componentProps}
          id={key}
          disabled={disabled}
          key={componentProps.dateType || 'date'}
          fixIn={curFixIn}
          handleChange={handleChange}
          value={value}
        />
      </FormItem>
    );
  });

export const config = {
  name: 'datePicker',
  Component: FormDatePicker, // ???React?????????props????????????value???onChange
  requiredCheck: (value) => {
    // ???????????????????????????????????????
    return [!isEmpty(value), i18n.t('can not be empty')];
  },
  fixOut: (value, options) => {
    // ??????????????????????????????React?????????value???????????????????????????
    return value;
  },
  fixIn: (value: any, options: any) => {
    const { dateType = 'date' } = options || {};
    if (dateType === 'range' && !isArray(value)) return undefined;
    if (dateType !== 'range' && isArray(value)) return undefined;
    // ???schema???React??????????????????????????????React?????????value
    return value;
  },
  extensionFix: (data, options) => {
    // ???schema???React??????????????????????????????React??????????????????
    return data;
  },
};

export const formConfig = {
  datePicker: {
    name: '???????????????',
    value: 'datePicker',
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
            key: 'componentProps.dateType',
            type: 'radio',
            component: 'radio',
            defaultValue: 'date',
            dataSource: {
              static: [
                { name: '??????', value: 'date' },
                { name: '??????', value: 'month' },
                { name: '????????????', value: 'range' },
                { name: '??????', value: 'week' },
              ],
            },
          },
          {
            label: '????????????',
            key: 'componentProps.allowClear',
            type: 'switch',
            component: 'switch',
          },
          {
            label: 'placeholder',
            key: 'componentProps.placeholder',
            type: 'input',
            component: 'input',
            componentProps: {
              placeholder: '???????????????,????????????placehoder',
            },
          },
          {
            label: '????????????',
            key: 'componentProps.showTime',
            type: 'switch',
            component: 'switch',
            defaultValue: true,
            removeWhen: [[{ field: 'componentProps.dateType', operator: 'includes', value: ['week', 'month'] }]],
            componentProps: {
              labelTip: '????????????????????????',
            },
          },
        ],
      },
    },
  },
};

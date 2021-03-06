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
import { DataSourceSelector } from 'project/common/components/datasource-selector';
import * as React from 'react';
import { isEmpty } from 'lodash';
import { commonFields, rulesField, checkWhen } from 'app/configForm/nusi-form/form-items';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';

const FormItem = Form.Item;
const noop = (a: any) => a;

export const FormDataSourceSelector = ({ fixOut = noop, fixIn = noop, requiredCheck }: any = {}) =>
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
    const params = routeInfoStore.getState((s) => s.params);
    const projectId = params.projectId || componentProps.projectId;

    registerRequiredCheck(_requiredCheck || requiredCheck);
    const handleChange = (e: any) => {
      form.setFieldValue(key, fixOut(e));
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
        <DataSourceSelector
          id={key}
          {...componentProps}
          projectId={projectId}
          disabled={disabled}
          value={fixIn(value)}
          onChange={handleChange}
        />
      </FormItem>
    );
  });

export const config = {
  name: 'dataSourceSelector',
  Component: FormDataSourceSelector, // ???React?????????props????????????value???onChange
  requiredCheck: (value: any) => {
    // ???????????????????????????????????????
    const invalid = Array.isArray(value) ? !isEmpty(value) : value !== undefined && value !== '';
    return [invalid, i18n.t('can not be empty')];
  },
  fixOut: (value: any, options) => {
    // ??????????????????????????????React?????????value???????????????????????????
    return value;
  },
  fixIn: (value: any, options) => {
    // ???schema???React??????????????????????????????React?????????value
    return value;
  },
  extensionFix: (data, options) => {
    // ???schema???React??????????????????????????????React??????????????????
    return data;
  },
};

export const formConfig = {
  dataSourceSelector: {
    name: '???????????????',
    value: 'dataSourceSelector',
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
            label: 'projectId',
            key: 'componentProps.projectId',
            type: 'input',
            component: 'input',
            defaultValue: '',
            labelTip: 'projectID????????????????????????????????????',
          },
          {
            label: '???????????????',
            key: 'componentProps.dataSourceType',
            type: 'select',
            component: 'select',
            defaultValue: 'MySQL',
            dataSource: {
              static: [
                { name: 'mysql', value: 'MySQL' },
                { name: 'redis', value: 'Redis' },
              ],
            },
          },
        ],
      },
    },
  },
};

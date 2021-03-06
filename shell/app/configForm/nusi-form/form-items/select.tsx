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

import { Divider, Form, Select } from 'app/nusi';
import * as React from 'react';
import { isEmpty, isArray, map } from 'lodash';
import { getData } from '../utils';
import { getLabel, noop } from './common';
import { commonFields, checkWhen } from './common/config';
import i18n from 'i18n';

const FormItem = Form.Item;
const { Option } = Select;

const empty = {};
const PureFormSelect = (props: any) => {
  const { fieldConfig, form, fixOut, fixIn, requiredCheck } = props || {};
  const [options, setOptions] = React.useState([] as any[] | Function);
  const [loading, setLoading] = React.useState(false);
  const {
    key,
    value,
    label,
    labelTip,
    dataSource = empty,
    visible,
    disabled,
    componentProps,
    wrapperProps,
    required,
    registerRequiredCheck = noop,
    valid,
    fixIn: itemFixIn,
    fixOut: itemFixOut,
    requiredCheck: _requiredCheck,
  } = fieldConfig || {};
  const curFixIn = itemFixIn || fixIn;
  const curFixOut = itemFixOut || fixOut;
  const {
    options: cOptions,
    selectAll,
    onChange: compOnChange,
    mode,
    optionFilterProp = 'children',
    placeholder,
    ...rest
  } = componentProps;

  React.useEffect(() => {
    const { dynamic, type, static: staticData } = dataSource;
    const curOption = cOptions || staticData;

    if (!isEmpty(dynamic) && type === 'dynamic' && isEmpty(curOption)) {
      if (dynamic.api && dynamic.dataPath && dynamic.valueKey && dynamic.nameKey) {
        setLoading(true);
        getData(dynamic).then((res: any[]) => {
          setLoading(false);
          setOptions(res);
          if (typeof dynamic.onLoad === 'function') {
            dynamic.onLoad(res);
          }
        });
      }
    } else if (typeof curOption === 'function') {
      setOptions(() => curOption);
    } else if (Array.isArray(curOption)) {
      setOptions(map(curOption, (op) => ({ ...op, label: op.label || op.name })));
    }
  }, [dataSource, cOptions]);

  const handleChange = (...args: any) => {
    form.setFieldValue(key, curFixOut(args[0]));
    compOnChange?.(...args);
  };

  registerRequiredCheck(_requiredCheck || requiredCheck);

  const customOptions = typeof options === 'function' ? options() : options;
  const renderOptions =
    Array.isArray(customOptions) && customOptions.some((item) => typeof item.$$typeof === 'symbol')
      ? customOptions
      : customOptions.map((s: any) => (
          <Option key={s.value} value={s.value}>
            {s.label}
          </Option>
        ));

  const _placeholder = placeholder || i18n.t('please select {name}', { name: label || key });

  const selectAllHandle = () => {
    const allValues = map(customOptions, (item) => item.value);
    form.setFieldValue(key, allValues);
  };

  const selectAllCancel = () => {
    form.setFieldValue(key, []);
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
      <Select
        id={key}
        getPopupContainer={() => document.body}
        {...rest}
        mode={mode}
        placeholder={_placeholder}
        disabled={disabled}
        value={curFixIn(value)}
        onChange={handleChange}
        loading={loading}
        optionFilterProp={optionFilterProp}
        dropdownRender={(menu) => {
          return (
            <div>
              {mode === 'multiple' && selectAll ? (
                <div className="pt8">
                  <span className="ml8 text-link" onClick={selectAllHandle} onMouseDown={(e) => e.preventDefault()}>
                    {i18n.t('project:select all')}
                  </span>
                  <span className="ml8 text-link" onClick={selectAllCancel} onMouseDown={(e) => e.preventDefault()}>
                    {i18n.t('clear')}
                  </span>
                  <Divider style={{ margin: '8px 0' }} />
                </div>
              ) : null}
              {menu}
            </div>
          );
        }}
      >
        {renderOptions}
      </Select>
    </FormItem>
  );
};

export const FormSelect = ({
  fixOut = noop,
  fixIn = noop,
  requiredCheck,
  extensionFix,
  trigger = 'onChange',
}: any = {}) => {
  return React.memo((props: any) => (
    <PureFormSelect
      fixOut={fixOut}
      fixIn={fixIn}
      requiredCheck={requiredCheck}
      extensionFix={extensionFix}
      trigger={trigger}
      {...props}
    />
  ));
};

export const config = {
  name: 'select',
  Component: FormSelect, // ???React?????????props????????????value???onChange
  requiredCheck: (value) => {
    // ???????????????????????????????????????
    return [isArray(value) ? !isEmpty(value) : value !== undefined, i18n.t('can not be empty')];
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
  // event: { // ?????????????????????eventName???????????????React??????????????????
  //   eventName: {
  //     handleName: 'onFocus',
  //   },
  // },
};

export const formConfig = {
  select: {
    name: '?????????',
    value: 'select',
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
            label: 'placeholder',
            key: 'componentProps.placeholder',
            type: 'input',
            component: 'input',
          },
          {
            label: '????????????',
            key: 'componentProps.allowClear',
            type: 'switch',
            component: 'switch',
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
          {
            label: '????????????',
            key: 'dataSource.type',
            type: 'radio',
            component: 'radio',
            defaultValue: 'static',
            dataSource: {
              static: [
                { name: '??????', value: 'static' },
                { name: '??????', value: 'dynamic' },
              ],
            },
          },
          {
            label: '????????????',
            key: 'componentProps.options',
            type: 'dataStatic',
            component: 'dataStatic',
            removeWhen: [[{ field: 'dataSource.type', operator: '!=', value: 'static' }]],
          },
          {
            label: '????????????',
            key: 'dataSource.dynamic',
            type: 'dataDynamic',
            component: 'dataDynamic',
            removeWhen: [[{ field: 'dataSource.type', operator: '!=', value: 'dynamic' }]],
          },
        ],
      },
    },
  },
};

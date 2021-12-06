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

import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Radio, Checkbox, Cascader, DatePicker, Tooltip } from 'antd';
import { FormInstance } from 'core/common/interface';
import classnames from 'classnames';
import { ErdaIcon } from 'common';
import i18n from 'i18n';

interface IProps {
  onChange?: (...args: unknown[]) => void;
}

class ClassWrapper extends React.PureComponent<IProps> {
  /**
   * @override
   * @param args
   */
  onChange = (...args: unknown[]) => {
    const { children, onChange } = this.props;
    // default onChange form item automatic inject
    onChange?.(...args);
    // child component onChange method
    children?.props?.onChange?.(...args);
  };
  render() {
    const { children, ...rest } = this.props;
    if (!children || typeof children !== 'object') {
      return children || null;
    }
    return React.cloneElement(children as any, {
      ...rest,
      onChange: this.onChange,
    });
  }
}

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const defalutFormItemLayout = {
  labelCol: {
    sm: { span: 24 },
    md: { span: 6 },
    lg: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 18 },
    lg: { span: 14 },
  },
};
const fullWrapperCol = { span: 24 };
const defalutTailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 24,
      offset: 0,
    },
    md: {
      span: 18,
      offset: 6,
    },
    lg: {
      span: 14,
      offset: 6,
    },
  },
};
export interface IFormItem {
  form?: FormInstance;
  label?: string;
  labelTip?: string;
  name?: string | string[];
  type?: string;
  initialValue?: any;
  size?: 'default' | 'small' | 'large';
  required?: boolean;
  pattern?: RegExp | null;
  message?: string;
  itemProps?: any;
  extraProps?: object;
  rules?: any[];
  config?: object;
  options?: Array<{ name: string; value: string | number; disabled?: boolean }> | Function;
  suffix?: string | null;
  formItemLayout?: object;
  className?: string;
  tailFormItemLayout?: object;
  formLayout?: string | null;
  noColon?: boolean;
  isTailLayout?: boolean; // no label, put some offset to align right part
  onChange?: any;
  addOne?: (name: string | undefined) => void;
  dropOne?: (name: string | undefined) => void;
  getComp?: ({ form }: { form: FormInstance }) => React.ReactElement<any> | string;
}
const RenderFormItem = ({
  form,
  label,
  labelTip,
  name,
  type,
  initialValue = null,
  size = 'default',
  required = true,
  pattern = null,
  message = i18n.t('common:please fill in the format correctly'),
  itemProps = {},
  extraProps = {},
  className = '',
  rules = [],
  config,
  options = [],
  addOne,
  dropOne,
  getComp,
  suffix = null,
  formItemLayout,
  formLayout,
  tailFormItemLayout,
  noColon = false,
  isTailLayout, // no label, put some offset to align right part
}: IFormItem) => {
  let ItemComp = null;
  const specialConfig: any = {};
  let _type = type;
  if (typeof getComp === 'function') {
    _type = 'custom';
  }
  let action = i18n.t('common:input');
  switch (_type) {
    case 'select':
      if (itemProps.mode === 'multiple') {
        specialConfig.valuePropType = 'array';
      }
      ItemComp = (
        <Select {...itemProps} size={size}>
          {typeof options === 'function'
            ? options()
            : options.map((single) => (
                <Option key={single.value} value={`${single.value}`} disabled={!!single.disabled}>
                  {single.name}
                </Option>
              ))}
        </Select>
      );
      action = i18n.t('common:select');
      break;
    case 'inputNumber':
      ItemComp = (
        <InputNumber {...itemProps} className={classnames('input-with-icon', itemProps.className)} size={size} />
      );
      break;
    case 'textArea':
      ItemComp = <TextArea {...itemProps} className={classnames('input-with-icon', itemProps.className)} />;
      break;
    case 'switch':
      specialConfig.valuePropName = 'checked';
      specialConfig.valuePropType = 'boolean';
      ItemComp = <Switch {...itemProps} />;
      action = i18n.t('common:select');
      break;
    case 'radioGroup':
      ItemComp = (
        <Radio.Group buttonStyle="solid" {...itemProps} size={size}>
          {typeof options === 'function'
            ? options()
            : options.map((single) => (
                <Radio.Button key={single.value} value={`${single.value}`} disabled={!!single.disabled}>
                  {single.name}
                </Radio.Button>
              ))}
        </Radio.Group>
      );
      action = i18n.t('common:select');
      break;
    case 'checkbox':
      specialConfig.valuePropName = 'checked';
      specialConfig.valuePropType = 'boolean';
      if (itemProps.options) {
        ItemComp = <Checkbox.Group {...itemProps} />;
      } else {
        const { text = '', ...checkboxProps } = itemProps;
        ItemComp = <Checkbox {...checkboxProps}>{text}</Checkbox>;
      }
      action = i18n.t('common:select');
      break;
    case 'datePicker':
      ItemComp = (
        <DatePicker className="w-full" allowClear={false} format="YYYY-MM-DD" showTime={false} {...itemProps} />
      );
      break;
    case 'custom':
      // getFieldDecorator不能直接包裹FunctionalComponent，see https://github.com/ant-design/ant-design/issues/11324
      ItemComp = <ClassWrapper {...itemProps}>{(getComp as Function)({ form })}</ClassWrapper>;
      break;
    case 'cascader':
      specialConfig.valuePropType = 'array';
      ItemComp = <Cascader {...itemProps} options={options} />;
      break;
    case 'input':
    default:
      ItemComp = <Input {...itemProps} className={classnames('input-with-icon', itemProps.className)} size={size} />;
      break;
  }

  const layout =
    label === undefined
      ? fullWrapperCol
      : isTailLayout
      ? tailFormItemLayout || defalutTailFormItemLayout
      : formLayout === 'horizontal'
      ? formItemLayout || defalutFormItemLayout
      : null;

  // generate rules
  if (required && !rules.some((r) => r.required === true)) {
    if (typeof label === 'string' && label.length) {
      const hasColon = !noColon && (label.endsWith(':') || label.endsWith('：'));
      rules.push({
        required,
        message: `${i18n.t('common:please')}${action}${hasColon ? label.slice(0, label.length - 1) : label}`,
      });
    } else if (label) {
      rules.push({
        required,
        message: i18n.t('can not be empty'),
      });
    }
  }
  if (pattern && !rules.some((r) => r.pattern && r.pattern.source === pattern.source)) {
    rules.push({ pattern, message });
  }
  // generate config
  const itemConfig = {
    rules,
    ...specialConfig,
    ...config,
  };
  if (initialValue !== null) {
    switch (itemConfig.valuePropType) {
      case 'boolean':
        itemConfig.initialValue = !!initialValue;
        break;
      case 'array':
        itemConfig.initialValue = initialValue;
        break;
      default:
        itemConfig.initialValue = initialValue.toString();
    }
  }
  const _label = labelTip ? (
    <span>
      {label}&nbsp;
      <Tooltip title={labelTip}>
        <ErdaIcon type="help" className="align-middle text-icon" />
      </Tooltip>
    </span>
  ) : (
    label
  );

  return (
    <FormItem
      label={_label}
      {...layout}
      className={`${itemProps.type === 'hidden' ? 'hidden' : ''} ${className}`}
      required={required}
    >
      <FormItem
        name={typeof name === 'string' && name?.includes('.') ? name.split('.') : name}
        noStyle
        {...extraProps}
        {...itemConfig}
      >
        {ItemComp}
      </FormItem>
      {suffix}
      {addOne ? (
        <ErdaIcon type="add-one" className="render-form-op" onClick={() => addOne(name)} />
      ) : null}
      {dropOne ? (
        <ErdaIcon type="reduce-one" className="render-form-op" onClick={() => dropOne(name)} />
      ) : null}
    </FormItem>
  );
};

export default RenderFormItem;

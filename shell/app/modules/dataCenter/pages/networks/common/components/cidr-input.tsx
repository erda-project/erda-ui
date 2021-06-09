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

import * as React from 'react';
import { Input, Select, Radio, Form, Tooltip } from 'app/nusi';
import { map } from 'lodash';
import { useUpdate } from 'common';
import { getSubnetNum, getIPItemOption, getIPTooltipText } from '../util';
import { formConfig } from '../config';
import i18n from 'i18n';
import './cidr-input.scss';

const { Option } = Select;
const FormItem = Form.Item;

interface IVswCIDRProps {
  form: any;
  vpcCidrBlock?: string;
  onChangeMask?: (val: number) => void;
  formKey?: string;
}

const validateIncludes = (options: any[]) => (rule: any, value: string, callback: Function) => {
  return callback(!value || options.includes(+value) ? undefined : i18n.t('invalid input'));
};
const maxMask = 29;
const minMask = 16;
export const VswCIDRField = ({
  form,
  vpcCidrBlock = '0.0.0.0/0',
  onChangeMask,
  formKey = 'cidrBlock',
}: IVswCIDRProps) => {
  const [{ maskOptions, IPItemOption }, updater, update] = useUpdate({
    maskOptions: [] as number[],
    IPItemOption: {} as number[][],
  });

  React.useEffect(() => {
    const vpcMask = getSubnetNum(vpcCidrBlock).pop() as number;
    const allOpt = Array.from(new Array(maxMask + 1).keys());
    const curMin = vpcMask >= minMask ? vpcMask + 1 : minMask;
    const defaultMask = curMin > 24 ? curMin : 24;
    // 设置默认
    form && form.setFieldsValue({ [`${formKey}.4`]: defaultMask });
    onChangeMask && onChangeMask(defaultMask);
    const options = getIPItemOption(vpcCidrBlock, defaultMask);
    setDefault(options);
    update({
      maskOptions: allOpt.slice(curMin),
      IPItemOption: options,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpcCidrBlock]);

  const changeMask = (val: string) => {
    onChangeMask && onChangeMask(+val);
    const options = getIPItemOption(vpcCidrBlock, +val);
    setDefault(options);
    updater.IPItemOption(options);
  };

  const setDefault = (options: number[][]) => {
    map(options, (item, idx) => {
      form.setFieldsValue({ [`${formKey}.${idx}`]: item[0] || 0 });
    });
  };

  const getFormItem = (index: number) => {
    const options = IPItemOption[index] || ([] as number[]);
    return (
      <FormItem>
        <Tooltip title={getIPTooltipText(options)}>
          {form.getFieldDecorator(`${formKey}.${index}`, {
            rules: [
              { required: true, message: i18n.t('{name} can not empty') },
              { validator: validateIncludes(options) },
            ],
          })(<Input disabled={options.length <= 1} />)}
        </Tooltip>
      </FormItem>
    );
  };

  return (
    <div className="cidr-input-form">
      {getFormItem(0)}
      <span className="split">•</span>
      {getFormItem(1)}
      <span className="split">•</span>
      {getFormItem(2)}
      <span className="split">•</span>
      {getFormItem(3)}
      <span className="split">/</span>
      <FormItem>
        {form.getFieldDecorator(`${formKey}.4`)(
          <Select onChange={(val: any) => changeMask(val)}>
            {map(maskOptions, (item) => {
              return (
                <Option key={item} value={item}>
                  {item}
                </Option>
              );
            })}
          </Select>,
        )}
      </FormItem>
    </div>
  );
};

interface ICIDRProps {
  value?: string;
  onChange?: (val: string) => void;
  onChangeCIDRType: (val: string) => void;
  cidrType: string;
}

export const VpcCIDRField = ({ value, onChange, cidrType, onChangeCIDRType }: ICIDRProps) => {
  const CIDRBlockMap = {
    default: (
      <Select
        onChange={(val: any) => {
          onChange && onChange(val);
        }}
        value={value}
      >
        {map(formConfig.options.defaultCIDR, (item) => (
          <Option key={item} value={item}>
            {item}
          </Option>
        ))}
      </Select>
    ),
    custom: (
      <Input
        value={value}
        defaultValue={formConfig.options.defaultCIDR[0]}
        onChange={(e: any) => {
          onChange && onChange(e.target.value);
        }}
      />
    ),
  };

  return (
    <div>
      <Radio.Group className="mb8" value={cidrType} onChange={(e: any) => onChangeCIDRType(e.target.value)}>
        {map(formConfig.options.CIDRType, (item) => {
          return (
            <Radio key={item.value} value={item.value}>
              {item.name}
            </Radio>
          );
        })}
      </Radio.Group>
      {CIDRBlockMap[cidrType]}
    </div>
  );
};

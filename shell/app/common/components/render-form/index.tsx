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

import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Row, Col, Avatar } from 'antd';
import classNames from 'classnames';
import RenderFormItem from '../render-formItem';
import { FormInstance } from 'core/common/interface';
import { forEach, map, isPlainObject, get } from 'lodash';
import './index.scss';

interface IProps {
  list: any[];
  form: FormInstance;
  className?: string;
  layout?: 'inline' | 'horizontal' | 'vertical';
  formItemLayout?: object;
  onlyItems?: boolean;
  style?: object;
}
const FormItem = Form.Item;

class RenderPureForm extends React.Component<IProps> {
  render() {
    const { list, form, className = '', layout = 'horizontal', formItemLayout, onlyItems = false, style } = this.props;
    const itemLayout = layout === 'horizontal' ? formItemLayout : null;
    const items = list.map((info, i) => {
      if (info.subList) {
        // subList是一个二维数组，第一维是行数， 第二维是每行的具体内容
        const { subList = [], getComp, itemProps = {} } = info;
        const compType = itemProps.type;
        const subRows = subList.map((rowFields: any) => {
          if (!Array.isArray(rowFields) || rowFields.length === 0) {
            return null;
          }
          return (
            <Row key={`sub-row${String(i)}`}>
              {rowFields.map((subField, j) => {
                let {
                  itemProps: { span = 24 },
                } = subField;
                const {
                  itemProps: { type },
                } = subField;
                if (type === 'hidden' || compType === 'hidden') {
                  span = 0;
                }
                return (
                  <Col key={`sub-field${String(j)}`} span={span}>
                    <RenderFormItem form={form} formItemLayout={itemLayout} formLayout={layout} {...subField} />
                  </Col>
                );
              })}
            </Row>
          );
        });
        if (getComp && compType !== 'hidden') {
          const Comp = getComp;
          return <Comp key={`sub-comp${String(i)}`}>{subRows}</Comp>;
        }
        return subRows;
      } else {
        return (
          <RenderFormItem key={info.name || i} form={form} formItemLayout={itemLayout} formLayout={layout} {...info} />
        );
      }
    });
    const formClass = classNames(className, 'render-form');
    return onlyItems ? (
      items
    ) : (
      <Form form={form} className={formClass} layout={layout} style={style}>
        {items}
      </Form>
    );
  }
}

const RenderForm = forwardRef((props: any, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => form);
  return <RenderPureForm form={form} {...props} />;
});

interface IReadonlyProps {
  fieldsList: IField[];
  data?: any;
}
interface IField {
  label?: string;
  name?: string;
  viewType?: string;
  itemProps?: {
    type?: string;
    [proName: string]: any;
  };
  getComp?: (o?: any) => any;
}

const ReadonlyForm = ({ fieldsList, data }: IReadonlyProps) => {
  const readonlyView: JSX.Element[] = [];
  forEach(fieldsList, (item, index) => {
    const { itemProps, label, name, viewType, getComp } = item;
    if (!(itemProps && itemProps.type === 'hidden') && label) {
      const value = name === undefined && getComp ? getComp() : get(data, name || '');
      if (value !== undefined && value !== null && value !== '') {
        if (viewType === 'image') {
          readonlyView.push(
            <FormItem label={label} key={index}>
              <Avatar shape="square" src={value} size={100} />
            </FormItem>,
          );
        } else {
          readonlyView.push(
            <FormItem label={label} key={index}>
              <p className="form-item-text">
                {Array.isArray(value) ? (
                  map(value, (v: string, i: number) => (
                    <span key={`${i}${v}`}>
                      &nbsp;&nbsp;{isPlainObject(v) ? JSON.stringify(v) : v.toString()}
                      <br />
                    </span>
                  ))
                ) : (
                  <>&nbsp;&nbsp;{value !== undefined ? value.toString() : undefined}</>
                )}
              </p>
            </FormItem>,
          );
        }
      }
    }
  });
  return <Form layout="vertical">{readonlyView}</Form>;
};

export { RenderForm, RenderPureForm, ReadonlyForm };

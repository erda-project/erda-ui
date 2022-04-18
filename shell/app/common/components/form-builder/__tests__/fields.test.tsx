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
import { Form, Input } from 'antd';
import { FormContext, IContextType } from '../form-builder';
import { Fields } from '../fields';
import { render } from '@testing-library/react';

type IField = Parameters<typeof Fields>[0];

describe('Fields', () => {
  const setUp = (props: Partial<IField>, context: IContextType) => {
    const field = {
      type: Input,
      fieldKey: 'name',
      id: 'name',
      name: 'name',
      required: true,
    };
    const Comp = ({ context: c_content, ...c_props }: Merge<IField, { context: IContextType }>) => {
      const [form] = Form.useForm();
      return (
        <Form form={form}>
          <FormContext.Provider value={c_content}>
            <Fields {...c_props} fields={c_props.fields || [field]} />
          </FormContext.Provider>
        </Form>
      );
    };
    const result = render(<Comp {...(props as Required<IField>)} context={context} />);
    const rerender = (n_props: Partial<IField>, n_context: IContextType) => {
      result.rerender(<Comp {...(n_props as Required<IField>)} context={n_context} />);
    };
    return {
      field,
      result,
      rerender,
    };
  };
  it('should work well', () => {
    const content: IContextType = {
      parentIsMultiColumn: false,
      parentColumnNum: 2,
      parentReadonly: false,
      setFieldsInfo: jest.fn(),
    };
    const { result, rerender, field } = setUp({}, content);
    expect(result.container).isExist('.ant-col-24', 1);
    rerender({}, { ...content, parentIsMultiColumn: true });
    expect(result.container).isExist('.ant-col-12', 1);
    rerender({ columnNum: 3 }, { ...content, parentIsMultiColumn: true });
    expect(result.container).isExist('.ant-col-8', 1);
    rerender({}, { ...content, parentIsMultiColumn: true, parentColumnNum: 0, realColumnNum: 4 });
    expect(result.container).isExist('.ant-col-6', 1);
    rerender({}, { ...content, parentIsMultiColumn: true, parentColumnNum: 0, realColumnNum: 0 });
    expect(result.container.querySelector('.ant-form')?.firstChild).toBeNull();
    rerender({}, undefined);
    expect(result.container.querySelector('.ant-form')?.firstChild).toBeNull();
    rerender(
      {
        fid: 'name',
        fields: [
          {
            ...field,
            isHoldLabel: false,
          },
        ],
      },
      content,
    );
    expect(content.setFieldsInfo).toHaveBeenLastCalledWith('name', [
      {
        ...field,
        isHoldLabel: false,
      },
    ]);
    expect(result.container).isExist('.no-label', 1);
    rerender(
      {
        fields: [
          {
            ...field,
            label: 'NAME',
            rules: [
              {
                required: true,
              },
            ],
          },
        ],
      },
      content,
    );
    expect(result.container).isExist('.no-label', 0);
    rerender(
      { fields: [{ ...field, readonly: true, customProps: { className: 'read-only-Item', value: 'readOnlyItem' } }] },
      content,
    );
    expect(result.container).isExist('.read-only-Item', 1);
    rerender(
      { fields: [{ ...field, customProps: { className: 'read-only-Item', value: 'readOnlyItem' } }], readonly: true },
      content,
    );
    expect(result.container).isExist('.read-only-Item', 1);
    rerender(
      { fields: [{ ...field, customProps: { className: 'read-only-Item', value: 'readOnlyItem' } }] },
      { ...content, parentReadonly: <div>readOnlyItem</div> },
    );
    expect(result.container).isExist('.read-only-Item', 1);
  });
});

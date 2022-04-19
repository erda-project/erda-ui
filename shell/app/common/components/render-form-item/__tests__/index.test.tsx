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
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Form, FormInstance } from 'antd';
import { resetMockDate, setMockDate } from 'test/utils';
import RenderFormItem, { IFormItem } from '..';

describe('RenderFormItem', () => {
  const setUp = (props: IFormItem) => {
    let formRef: FormInstance | undefined;
    const Comp = (c_props: IFormItem) => {
      const [form] = Form.useForm();
      formRef = form;
      return (
        <Form form={form}>
          <RenderFormItem {...c_props} form={form} />
        </Form>
      );
    };
    const result = render(<Comp {...props} />);
    const rerender = (n_props: IFormItem) => {
      result.rerender(<Comp {...n_props} />);
    };
    return {
      formRef,
      result,
      rerender,
    };
  };
  it('should work well when default type', () => {
    const addOneFn = jest.fn();
    const dropOneFn = jest.fn();
    const { result, formRef, rerender } = setUp({
      name: 'name',
      label: 'name',
      initialValue: 'erda',
      addOne: addOneFn,
      dropOne: dropOneFn,
    });
    expect(formRef?.getFieldValue('name')).toBe('erda');
    expect(result.queryByRole('textbox')).not.toBeNull();
    fireEvent.click(result.container.querySelector('[name="add-one"]')!);
    expect(addOneFn).toHaveBeenLastCalledWith('name');
    fireEvent.click(result.container.querySelector('[name="reduce-one"]')!);
    expect(addOneFn).toHaveBeenLastCalledWith('name');
    rerender({ readOnly: true, label: 'name', initialValue: 'erda' });
    expect(result.queryByRole('textbox')).toBeNull();
    rerender({
      readOnly: true,
      label: 'name',
      initialValue: 'erda',
      readOnlyRender: (value) => {
        return <div className="read-only-render">{value}</div>;
      },
    });
    expect(result.container).isExist('.read-only-render', 1);
  });
  it('should work well when type is textArea', () => {
    const { result } = setUp({
      name: 'name',
      label: 'name',
      type: 'textArea',
    });
    expect(result.container).isExist('textarea', 1);
  });
  it('should work well when type is inputNumber', () => {
    const { result } = setUp({
      name: 'name',
      label: 'name',
      type: 'inputNumber',
    });
    expect(result.container).isExist('.ant-input-number', 1);
  });
  it('should work well when type is switch', () => {
    const { result, formRef } = setUp({
      name: 'name',
      label: 'name',
      type: 'switch',
      initialValue: true,
    });
    expect(formRef?.getFieldValue('name')).toBe(true);
    expect(result.queryByRole('switch')).not.toBeNull();
    fireEvent.click(result.getByRole('switch'));
    expect(formRef?.getFieldValue('name')).toBe(false);
  });
  it('should work well when type is checkbox', () => {
    const { result, formRef } = setUp({
      name: 'name',
      label: 'name',
      type: 'checkbox',
      initialValue: true,
    });
    expect(formRef?.getFieldValue('name')).toBe(true);
    expect(result.queryByRole('checkbox')).not.toBeNull();
    fireEvent.click(result.getByRole('checkbox'));
    expect(formRef?.getFieldValue('name')).toBe(false);
  });
  it('should work well when type is checkbox group', () => {
    const options = [
      { label: 'DOP', value: 'dop' },
      { label: 'MPS', value: 'msp' },
      { label: 'CMP', value: 'cmp' },
    ];
    const { result, formRef } = setUp({
      name: 'name',
      label: 'name',
      type: 'checkbox',
      initialValue: [options[0].value],
      itemProps: {
        options,
      },
    });
    expect(formRef?.getFieldValue('name')).toStrictEqual([options[0].value]);
    expect(result.queryAllByRole('checkbox')).toHaveLength(options.length);
    fireEvent.click(result.getAllByRole('checkbox')[1]);
    expect(formRef?.getFieldValue('name')).toStrictEqual([options[0].value, options[1].value]);
  });
  it('should work well when type is datePicker', () => {
    const { result } = setUp({
      name: 'name',
      label: 'name',
      type: 'datePicker',
    });
    expect(result.container).isExist('.ant-picker', 1);
  });
  it('should work well when type is radioGroup', () => {
    const options = [
      { name: 'DOP', value: 'dop' },
      { name: 'MPS', value: 'msp' },
      { name: 'CMP', value: 'cmp' },
    ];
    const { result, rerender, formRef } = setUp({
      name: 'name',
      label: 'name',
      type: 'radioGroup',
      options: () => [],
    });
    expect(result.container).isExist('.ant-radio-group', 1);
    rerender({
      name: 'name',
      label: 'name',
      type: 'radioGroup',
      options,
    });
    expect(result.getAllByRole('radio')).toHaveLength(options.length);
    fireEvent.click(result.getByText(options[1].name));
    expect(formRef?.getFieldValue('name')).toBe(options[1].value);
  });
  it('should work well when type is cascader', () => {
    const { result } = setUp({
      name: 'name',
      label: 'name',
      type: 'cascader',
    });
    expect(result.container).isExist('.ant-cascader-picker', 1);
  });
  it('should work well when type is custom', () => {
    const changeFn = jest.fn();
    const { result, rerender, formRef } = setUp({
      name: 'name',
      label: 'name',
      getComp: () => {
        return <input type="text" onChange={changeFn} />;
      },
    });
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenCalled();
    expect(formRef?.getFieldValue('name')).toBe('erda');
    rerender({
      name: 'name',
      label: 'name',
      getComp: () => {
        return 'erda';
      },
    });
    expect(result.queryByText('erda')).toBeTruthy();
    rerender({
      name: 'name',
      label: 'name',
      readOnly: true,
      readOnlyRender: (value) => {
        return <div className="read-only-render">{value}</div>;
      },
      getComp: () => {
        return 'erda';
      },
    });
    expect(result.container).isExist('.read-only-render', 1);
  });
  it('should work well when type is tagsSelect', async () => {
    const { result, rerender } = setUp({
      name: 'name',
      label: 'name',
      type: 'tagsSelect',
      itemProps: {
        mode: 'multiple',
      },
      options: () => [],
    });
    expect(result.container).isExist('.erda-tags-select', 1);
    const options = [
      { label: 'DOP', value: 'dop' },
      { label: 'MPS', value: 'msp' },
      { label: 'CMP', value: 'cmp' },
    ];
    rerender({
      name: 'name',
      label: 'name',
      type: 'tagsSelect',
      itemProps: {
        mode: 'multiple',
      },
      options,
    });
    fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
    fireEvent.focus(result.getByRole('combobox'));
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 1));
    fireEvent.change(result.getByRole('combobox'), { target: { value: options[0].label } });
    expect(result.queryAllByRole('option')).toHaveLength(1);
  });
  it('should work well when type is select', async () => {
    const spyOnError = jest.spyOn(console, 'error').mockImplementation();
    const options = [
      { label: 'quick-select', value: 'quick-select', fix: true },
      {
        label: 'option-DOP',
        value: 'dop',
        fix: false,
        children: [
          {
            label: 'project',
            value: 'project',
            icon: 'project',
            status: 'success',
          },
        ],
      },
      { label: 'option-MPS', value: 'msp', fix: false, icon: 'msp' },
      { label: 'option-CMP', value: 'cmp', fix: false },
    ];
    const unFixOptionsLen = options.filter((item) => !item.fix).length;
    const { result, rerender, formRef } = setUp({
      name: 'name',
      label: 'name',
      type: 'select',
      itemProps: {
        mode: 'multiple',
      },
      initialValue: [2],
      options,
    });
    expect(spyOnError).toHaveBeenCalled();
    rerender({
      name: 'name',
      label: 'name',
      type: 'select',
      itemProps: {
        mode: 'multiple',
        showSearch: true,
      },
      options,
    });
    fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
    fireEvent.focus(result.getByRole('combobox'));
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 1));
    expect(result.getAllByText(/option-/)).toHaveLength(unFixOptionsLen);
    fireEvent.change(result.getByRole('combobox'), { target: { value: options[1].label } });
    expect(result.getAllByText(/option-/)).toHaveLength(1);
    fireEvent.change(result.getByRole('combobox'), { target: { value: '' } });
    expect(result.getAllByText(/option-/)).toHaveLength(unFixOptionsLen);
    fireEvent.click(result.baseElement.querySelector('.cursor-pointer')!);
    expect(formRef?.getFieldValue('name')).toStrictEqual(['quick-select']);
    spyOnError.mockClear();
  });
  it.each([{ borderTime: false }, { borderTime: true }])(
    'should work well when type is dateRange with borderTime is $borderTime',
    async ({ borderTime }) => {
      const mockDate = setMockDate();
      const today = mockDate.moment;
      const todayStr = today.format('YYYY-MM-DD');
      const tomorrow = mockDate.moment.add(1, 'day');
      const tomorrowStr = tomorrow.format('YYYY-MM-DD');
      const { result, formRef } = setUp({
        name: 'name',
        label: 'name',
        type: 'dateRange',
        itemProps: {
          customProps: {
            borderTime,
            showClear: true,
          },
        },
      });
      fireEvent.mouseDown(result.getByPlaceholderText('startDate'));
      fireEvent.focus(result.getByPlaceholderText('startDate'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 1));
      fireEvent.click(result.baseElement.querySelector(`[title="${todayStr}"]`)!);
      fireEvent.mouseDown(result.getByPlaceholderText('endDate'));
      fireEvent.focus(result.getByPlaceholderText('endDate'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 2));
      fireEvent.click(result.baseElement.querySelectorAll(`[title="${tomorrowStr}"]`)[1]!);
      expect(formRef?.getFieldValue('name')).toStrictEqual([
        today.startOf('day').valueOf(),
        tomorrow.endOf('day').valueOf(),
      ]);
      fireEvent.click(result.baseElement.querySelector('.erda-form-date-range-clear')!);
      expect(formRef?.getFieldValue('name')).toStrictEqual([]);
      resetMockDate();
    },
  );
  it('should work well with required', async () => {
    const validateFields = async (formRef?: FormInstance) => {
      let res;
      try {
        res = await formRef?.validateFields();
      } catch (e) {
        res = e;
      }
      return res;
    };
    const { result, formRef, rerender } = setUp({
      name: 'name',
      label: 'name',
      labelTip: 'this is project name',
      type: 'input',
    });
    expect(result.container).isExist('[name="help"]', 1);
    expect(await validateFields(formRef)).toStrictEqual({
      errorFields: [{ errors: ['pleaseinputname'], name: ['name'] }],
      outOfDate: false,
      values: { name: undefined },
    });
    rerender({
      name: 'name',
      type: 'input',
      label: <div>name</div>,
      pattern: /^[A-Z\s]+$/,
      message: 'please enter capital letters',
      rules: [
        {
          max: 10,
          message: 'maxLength is 10',
        },
        {
          pattern: /^[A-Z]/,
          message: 'start with capital letters',
        },
      ],
    });
    expect(await validateFields(formRef)).toStrictEqual({
      errorFields: [{ errors: ['can not be empty'], name: ['name'] }],
      outOfDate: false,
      values: { name: undefined },
    });
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'THIS IS STRING THAT LENGTH GREATER THAN TEN' } });
    expect(await validateFields(formRef)).toStrictEqual({
      errorFields: [{ errors: ['maxLength is 10'], name: ['name'] }],
      outOfDate: false,
      values: { name: 'THIS IS STRING THAT LENGTH GREATER THAN TEN' },
    });
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'Erda' } });
    expect(await validateFields(formRef)).toStrictEqual({
      errorFields: [{ errors: ['please enter capital letters'], name: ['name'] }],
      outOfDate: false,
      values: { name: 'Erda' },
    });
  });
  it('should render well', () => {
    const config = {
      name: 'name',
      label: 'name',
      type: 'input',
    };
    const { result, rerender } = setUp(config);
    expect(result.container).not.isExistClass('.ant-form-item-control', 'ant-col-md-18');
    rerender({
      ...config,
      label: undefined,
    });
    expect(result.container).not.isExistClass('.ant-form-item-control', 'ant-col-md-18');
    rerender({
      ...config,
      isTailLayout: true,
    });
    expect(result.container).isExistClass('.ant-form-item-control', 'ant-col-md-18');
    rerender({
      ...config,
      formLayout: 'horizontal',
    });
    expect(result.container).isExistClass('.ant-form-item-label', 'ant-col-md-6');
    expect(result.container).isExistClass('.ant-form-item-control', 'ant-col-md-18');
  });
});

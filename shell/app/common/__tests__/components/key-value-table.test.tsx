import React from 'react';
import { KeyValueTable } from 'common';
import { Form } from 'app/nusi';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

const data = {
  env: 'test',
  org: 'erda',
  name: 'erda.cloud',
};

const Comp = Form.create()((props) => {
  return (
    <KeyValueTable
      {...props}
    />
  );
});

describe('KeyValueTable', () => {
  it('should dealTableData', () => {
    const obj = {
      ...data,
      _tb_key_name: 'CPU',
      _tb_value_name: '2',
    };
    expect(KeyValueTable.dealTableData(obj, 'extra')).toStrictEqual({
      env: 'test',
      extra: {
        CPU: '2',
      },
      name: 'erda.cloud',
      org: 'erda',
    });
    expect(KeyValueTable.dealTableData(obj)).toStrictEqual({
      CPU: '2',
      env: 'test',
      name: 'erda.cloud',
      org: 'erda',
    });
  });
  it('should render with TextArea', () => {
    const fn = jest.fn();
    const wrapper = mount(
      <Comp
        data={data}
        maxLength={10}
        isTextArea
        onChange={fn}
      />
    );
    const editor = wrapper.find('KeyValueTable');
    expect(editor.instance().getTableData()).toStrictEqual(data);
    expect(editor.state().dataSource).toHaveLength(3);
    expect(editor.find('TextArea')).toExist();
    editor.find('TextArea').at(0).simulate('blur');
    expect(fn).toHaveBeenCalled();
    editor.find('.add-row-btn-wrap').find('Button').simulate('click');
    expect(editor.state().dataSource).toHaveLength(4);
    editor.find('Popconfirm').at(0).prop('onConfirm')();
    expect(editor.state().dataSource).toHaveLength(3);
    wrapper.setProps({
      data: { ...data, displayName: 'erda', userName: 'erda', CPU: '2' },
    });
    wrapper.update();
    expect(editor.state().dataSource).toHaveLength(6);
  });
  it('should should render with Input', () => {
    const fn = jest.fn();
    const wrapper = mount(
      <Comp
        data={data}
        maxLength={10}
        onChange={fn}
        disableAdd
      />
    );
    const editor = wrapper.find('KeyValueTable');
    editor.find('Input').at(0).simulate('blur');
    expect(fn).toHaveBeenCalled();
  });
});

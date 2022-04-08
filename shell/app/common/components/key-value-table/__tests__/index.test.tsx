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
import { Form } from 'antd';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { flushPromises, sleep } from 'test/utils';
import KeyValueTable from '..';

describe('KeyValueTable', () => {
  const data = {
    env: 'test',
    org: 'erda',
    name: 'erda.cloud',
  };
  const setUp = (props) => {
    let tableRef: React.MutableRefObject<KeyValueTable | undefined>;
    const Comp = (c_props) => {
      const table = React.useRef<KeyValueTable>();
      tableRef = table;
      const [form] = Form.useForm();
      return (
        <Form form={form}>
          <KeyValueTable ref={table} data={data} maxLength={10} {...c_props} form={form} />
        </Form>
      );
    };
    const changeFn = jest.fn();
    const result = render(<Comp {...props} onChange={changeFn} />);
    const rerender = (newProps = {}) => {
      result.rerender(<Comp {...newProps} onChange={changeFn} />);
    };
    return {
      result,
      tableRef,
      changeFn,
      rerender,
    };
  };

  it('should KeyValueTable static method work well', () => {
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
  it('should work well', async () => {
    const { result, tableRef, rerender, changeFn } = setUp({ isTextArea: true });
    expect(tableRef.current?.getTableData()).toStrictEqual(data);
    rerender();
    expect(result.container).isExit('.ant-table-row ', Object.keys(data).length);
    fireEvent.click(result.getByText('Add'));
    await flushPromises();
    expect(result.container).isExit('.ant-table-row ', Object.keys(data).length + 1);
    fireEvent.click(result.getAllByText('delete')[0]);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.click(result.getByText('OK'));
    expect(result.container).isExit('.ant-table-row ', Object.keys(data).length);
    rerender({ existKeys: ['max_age'], isTextArea: true });
    fireEvent.click(result.getByText('Add'));
    await flushPromises();
    fireEvent.change(result.container.querySelector('input')!, { target: { value: 'max_age' } });
    fireEvent.blur(result.container.querySelector('input')!, { target: { value: 'max_age' } });
    await flushPromises();
    await sleep(1000);
    expect(result.queryByText('this configuration already exists')).not.toBeNull();
    fireEvent.change(result.container.querySelector('input')!, { target: { value: 'env' } });
    fireEvent.blur(result.container.querySelector('input')!, { target: { value: 'env' } });
    await flushPromises();
    await sleep(1000);
    expect(result.queryByText('key value must be unique')).not.toBeNull();
    fireEvent.change(result.container.querySelector('input')!, { target: { value: 'environment' } });
    fireEvent.blur(result.container.querySelector('input')!, { target: { value: 'environment' } });
    await flushPromises();
    fireEvent.change(result.container.querySelector('textarea')!, { target: { value: 'test' } });
    fireEvent.blur(result.container.querySelector('textarea')!, { target: { value: 'test' } });
    await flushPromises();
    expect(changeFn).toHaveBeenLastCalledWith({ env: 'test', environment: 'test', name: 'erda.cloud', org: 'erda' });
  });
});

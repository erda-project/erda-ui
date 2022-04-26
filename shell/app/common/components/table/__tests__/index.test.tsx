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
import '@testing-library/jest-dom';
import { ColumnProps, IActions } from '../interface';
import ErdaTable from '..';

interface IData {
  id: string;
  name: string;
  title: string;
  count: number;
}

describe('ErdaTable', () => {
  const dataSource = [
    {
      id: '1',
      name: 'erda',
      title: 'Erda',
      count: 1,
    },
    {
      id: '2',
      name: 'daily',
      title: 'Daily',
      count: 2,
    },
    {
      id: '3',
      name: 'test',
      title: 'Test',
      count: 0,
    },
  ];
  const columns: ColumnProps<IData>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'name',
      dataIndex: 'name',
      subTitle: 'projectName',
    },
    {
      title: 'Rule-Title',
      dataIndex: 'title',
    },
    {
      title: 'count',
      align: 'right',
      dataIndex: 'count',
    },
  ];
  const genTableActions = (onClick: () => void) => {
    const tableActions: IActions<IData> = {
      render: (record) => {
        return [
          {
            title: 'editAction',
            onClick,
          },
          {
            title: 'deleteAction',
            show: record.count === 0,
            onClick,
          },
        ];
      },
    };
    return tableActions;
  };

  const defaultPagination = {
    total: 99,
    pageSize: 10,
    current: 1,
  };

  it('should render well', () => {
    const pageChangeFn = jest.fn();
    const tableChangeFn = jest.fn();
    const newPagination = { ...defaultPagination, current: 2, onChange: pageChangeFn };
    const result = render(<ErdaTable columns={columns} dataSource={[]} hideHeader />);
    expect(result.container).isExist('.erda-table-filter', 0);
    result.rerender(<ErdaTable columns={columns} dataSource={[]} />);
    expect(result.container).isExist('.erda-table-filter', 1);
    result.rerender(
      <ErdaTable columns={columns} dataSource={[]} pagination={newPagination} onChange={tableChangeFn} />,
    );
    expect(result.getByText('This page has no data, whether to go')).toBeTruthy();
    fireEvent.click(result.getByText('page 1'));
    expect(pageChangeFn).toHaveBeenLastCalledWith(defaultPagination.current, defaultPagination.pageSize);
    expect(tableChangeFn).toHaveBeenLastCalledWith(
      { ...newPagination, current: 1 },
      {},
      {},
      { action: 'paginate', currentDataSource: [] },
    );
  });
  it('should work well with tableHeader', async () => {
    const reloadFn = jest.fn();
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={defaultPagination}
        onReload={reloadFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="refresh"]')!);
    expect(reloadFn).toHaveBeenLastCalledWith(defaultPagination.current, defaultPagination.pageSize);
    result.rerender(
      <ErdaTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="refresh"]')!);
    expect(tableChangeFn).toHaveBeenLastCalledWith(
      {
        current: defaultPagination.current,
        pageSize: defaultPagination.pageSize,
      },
      {},
      {},
      { action: 'paginate', currentDataSource: [] },
    );
    expect(pageChangeFn).toHaveBeenLastCalledWith(defaultPagination.current, defaultPagination.pageSize);
    expect(result.queryByText(columns[2].title as string, { selector: 'th' })).not.toBeNull();
    fireEvent.click(result.container.querySelector('[name="config"]')!);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.click(result.getAllByRole('checkbox')[2]);
    fireEvent.change(result.getAllByRole('checkbox')[2], { target: { checked: true } });
    expect(result.queryByText(columns[2].title as string, { selector: 'th' })).toBeNull();
  });
  it('should work well with actions', async () => {
    const actionFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={defaultPagination}
        actions={genTableActions(actionFn)}
      />,
    );
    expect(result.container).isExist('[name="more"]', dataSource.length);
    fireEvent.click(result.container.querySelectorAll('[name="more"]')[0]);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(result.getByText('EditAction').closest('li')!);
    expect(actionFn).toHaveBeenCalled();
  });
  it('should work well with sort is Object', async () => {
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const newColumns: ColumnProps<IData>[] = [
      ...columns.slice(0, 3),
      {
        title: 'count',
        dataIndex: 'count',
        sorter: {
          compare: (a, b) => a.count - b.count,
        },
      },
    ];
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={newColumns}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    expect(result.container).isExist('[name="caret-down"]', 1);
    fireEvent.click(result.container.querySelector('[name="caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('Ascending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
    fireEvent.click(result.getByText('Descending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
  });
  it('should work well with sour is function', async () => {
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={[
          ...columns.slice(0, 3),
          {
            title: 'count',
            dataIndex: 'count',
            sorter: (a, b) => a.count - b.count,
          },
        ]}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, current: undefined, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('Ascending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
    fireEvent.click(result.getByText('Descending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
  });
  it('should work well with sour is boolean', async () => {
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={[
          ...columns.slice(0, 3),
          {
            title: 'count',
            dataIndex: 'count',
            sorter: true,
          },
        ]}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, current: undefined, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('Ascending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(1);
    expect(tableChangeFn).toHaveBeenLastCalledWithNth(2, {
      column: { title: 'count', sorter: true, dataIndex: 'count' },
      columnKey: 'count',
      field: 'count',
      order: 'Ascending',
    });
    fireEvent.click(result.getByText('Descending').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(2);
    expect(tableChangeFn).toHaveBeenLastCalledWithNth(2, {
      column: { title: 'count', sorter: true, dataIndex: 'count' },
      columnKey: 'count',
      field: 'count',
      order: 'Descending',
    });
    fireEvent.click(result.getByText('Unsort').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(3);
    expect(tableChangeFn).toHaveBeenLastCalledWithNth(2, {
      column: { title: 'count', sorter: true, dataIndex: 'count' },
      columnKey: 'count',
      field: 'count',
      order: undefined,
    });
  });
  it('should work well with pagination', () => {
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="right"]')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(1);
    result.rerender(
      <ErdaTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...defaultPagination, current: undefined, onChange: pageChangeFn }}
        onChange={tableChangeFn}
      />,
    );
    fireEvent.click(result.container.querySelector('[name="right"]')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(1);
  });
  it('should work well with rowSelection', () => {
    const rowSelectionChangeFn = jest.fn();
    const result = render(
      <ErdaTable
        rowKey={(item) => item.id}
        columns={columns}
        dataSource={dataSource}
        rowSelection={{
          onChange: rowSelectionChangeFn,
          selectedRowKeys: [],
        }}
      />,
    );
    fireEvent.click(result.getAllByRole('checkbox')[1]);
    fireEvent.change(result.getAllByRole('checkbox')[1], { target: { checked: true } });
    expect(rowSelectionChangeFn).toHaveBeenCalledTimes(1);
  });
});

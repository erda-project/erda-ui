import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErdaTable, { ErdaColumnType } from '../../src/table';
import { TableRowActions } from '../../src/table/interface';
// import { TableRowActions } from 'src/table/interface';

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
  const columns: Array<ErdaColumnType<IData>> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'name',
      dataIndex: 'name',
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
    const tableActions: TableRowActions<IData> = {
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
    const result = render(<ErdaTable columns={columns} dataSource={[]} extraConfig={{ hideHeader: true }} />);
    expect(result.container).isExist('.erda-table-header', 0);
    result.rerender(<ErdaTable columns={columns} dataSource={[]} />);
    expect(result.container).isExist('.erda-table-header', 1);
    result.rerender(
      <ErdaTable columns={columns} dataSource={[]} pagination={newPagination} onChange={tableChangeFn} />,
    );
    expect(result.getByText('This page has no data, whether go to')).toBeTruthy();
    fireEvent.click(result.getByText('Page one'));
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
        extraConfig={{
          onReload: reloadFn,
        }}
      />,
    );
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-shuaxin"]')!);
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-shuaxin"]')!);
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-shezhi"]')!);
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
    expect(result.container).isExist('[xlink:href="#icon-gengduo"]', dataSource.length);
    fireEvent.click(result.container.querySelectorAll('[xlink:href="#icon-gengduo"]')[0]);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(result.getByText('editAction').closest('li')!);
    expect(actionFn).toHaveBeenCalled();
  });
  it('should work well with sort is Object', async () => {
    const tableChangeFn = jest.fn();
    const pageChangeFn = jest.fn();
    const newColumns: Array<ErdaColumnType<IData>> = [
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
    expect(result.container).isExist('[xlink:href="#icon-caret-down"]', 1);
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('ascend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
    fireEvent.click(result.getByText('descend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
  });
  it('should work well with sort is function', async () => {
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('ascend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
    fireEvent.click(result.getByText('descend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(0);
  });
  it('should work well with sort is boolean', async () => {
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-caret-down"]')!);
    await waitFor(() => expect(result.getByRole('menu')));
    fireEvent.click(result.getByText('ascend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(1);
    expect(tableChangeFn).toHaveBeenLastCalledWithNth(2, {
      column: { title: 'count', sorter: true, dataIndex: 'count' },
      columnKey: 'count',
      field: 'count',
      order: 'ascend',
    });
    fireEvent.click(result.getByText('descend').closest('li')!);
    expect(tableChangeFn).toHaveBeenCalledTimes(2);
    expect(tableChangeFn).toHaveBeenLastCalledWithNth(2, {
      column: { title: 'count', sorter: true, dataIndex: 'count' },
      columnKey: 'count',
      field: 'count',
      order: 'descend',
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-chevronright"]')!);
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
    fireEvent.click(result.container.querySelector('[xlink:href="#icon-chevronright"]')!);
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

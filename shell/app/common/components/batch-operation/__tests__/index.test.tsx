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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BatchOperation from '..';
import { IRowActions } from '../../table/interface';

const setUp = (props?: Obj) => {
  const isVisibleFnReturnTrue = jest.fn().mockReturnValue(true);
  const isVisibleFnReturnFalse = jest.fn().mockReturnValue(false);
  const operationFn = jest.fn();
  const asyncOperationFn = jest.fn().mockResolvedValue(true);
  const dataSource = [
    {
      id: 1,
      name: 'list item 1',
    },
    {
      id: 2,
      name: 'list item 2',
    },
    {
      id: 3,
      name: 'list item 3',
    },
    {
      id: 4,
      name: 'list item 4',
    },
    {
      id: 5,
      name: 'list item 5',
    },
  ];
  const operations: IRowActions[] = [
    {
      key: 'action edit',
      name: 'action edit',
      onClick: asyncOperationFn,
    },
    {
      key: 'action delete',
      name: 'action delete',
      onClick: operationFn,
    },
    {
      key: 'action disabled',
      name: 'action disabled',
      disabled: true,
      onClick: operationFn,
    },
    {
      key: 'action show',
      name: 'action show',
      isVisible: isVisibleFnReturnTrue,
      onClick: operationFn,
    },
    {
      key: 'action hidden',
      name: 'action hidden',
      isVisible: isVisibleFnReturnFalse,
      onClick: operationFn,
    },
  ];
  const selectFn = jest.fn();
  const result = render(
    <BatchOperation
      rowKey={'id'}
      dataSource={dataSource}
      onSelectChange={selectFn}
      {...props}
      operations={operations}
    />,
  );
  const rerenderWithProps = (reProps: Obj) => {
    result.rerender(
      <BatchOperation dataSource={dataSource} onSelectChange={selectFn} {...reProps} operations={operations} />,
    );
  };
  return {
    result,
    rerenderWithProps,
    dataSource,
    isVisibleFnReturnTrue,
    isVisibleFnReturnFalse,
    operationFn,
    asyncOperationFn,
    selectFn,
  };
};

describe('BatchOperation', () => {
  it('should render well', async () => {
    const selectedKeys = [1];
    const { isVisibleFnReturnTrue, isVisibleFnReturnFalse, asyncOperationFn, selectFn, operationFn, result } = setUp({
      selectedKeys,
    });
    expect(isVisibleFnReturnTrue).toHaveBeenCalledWith(selectedKeys);
    expect(isVisibleFnReturnFalse).toHaveBeenCalledWith(selectedKeys);
    userEvent.hover(result.getByText('batch operate'));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    expect(result.getAllByText(/action/)).toHaveLength(4);
    expect(screen.getByText('action disabled').closest('li')).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(result.getByText('action edit'));
    await waitFor(() => expect(asyncOperationFn).toHaveBeenLastCalledWith(selectedKeys));
    expect(selectFn).toHaveBeenLastCalledWith([]);
    fireEvent.click(result.getByText('action delete'));
    expect(operationFn).toHaveBeenLastCalledWith(selectedKeys);
  });
  it('should checkAll work well', () => {
    const rowKey = (item: { id: number }) => item.id;
    const { dataSource, selectFn, result, rerenderWithProps } = setUp({ rowKey });
    const allKey = dataSource.map((item) => item.id);
    fireEvent.click(result.getByRole('checkbox'));
    expect(selectFn).toHaveBeenCalledWith(allKey);
    rerenderWithProps({ selectedKeys: allKey });
    fireEvent.click(result.getByRole('checkbox'));
    expect(selectFn).toHaveBeenCalledWith([]);
  });
  it('should work well when there is only an operations', async () => {
    const selectFn = jest.fn();
    const operationFn = jest.fn();
    const asyncOperationFn = jest.fn().mockResolvedValue(true);
    const result = render(
      <BatchOperation
        onSelectChange={selectFn}
        dataSource={[]}
        operations={[
          {
            name: 'edit',
            key: 'edit',
            onClick: operationFn,
          },
        ]}
      />,
    );
    fireEvent.click(result.getByText('edit'));
    expect(operationFn).toHaveBeenCalledWith([]);
    expect(selectFn).toHaveBeenCalledWith([]);
    expect(selectFn).toHaveBeenCalledTimes(1);
    result.rerender(
      <BatchOperation
        onSelectChange={selectFn}
        dataSource={[]}
        operations={[
          {
            name: 'edit',
            key: 'edit',
            onClick: asyncOperationFn,
          },
        ]}
      />,
    );
    fireEvent.click(result.getByText('edit'));
    await waitFor(() => expect(asyncOperationFn).toHaveBeenLastCalledWith([]));
    expect(selectFn).toHaveBeenLastCalledWith([]);
    expect(selectFn).toHaveBeenCalledTimes(2);
  });
});

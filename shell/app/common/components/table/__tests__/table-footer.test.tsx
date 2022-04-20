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
import { fireEvent, render } from '@testing-library/react';
import TableFooter from '../table-footer';

describe('TableFooter', () => {
  const baseProps = {
    pagination: { total: 10 },
    hidePagination: true,
    onTableChange: jest.fn(),
    whiteFooter: true,
    rowKey: 'id',
    dataSource: [{ id: 1, name: 'erda' }],
    onSelectChange: jest.fn(),
  };
  it('should render well without actions and pagination', () => {
    const result = render(<TableFooter {...baseProps} />);
    expect(result.container).isExist('.erda-pagination', 0);
    expect(result.container).isExistClass('.erda-table-footer', 'bg-white');
    expect(result.container).not.isExistClass('.erda-table-footer', 'bg-default-02');
    expect(result.queryByText('0 items selected')).toBeNull();
  });
  it('should render well with actions', () => {
    const result = render(<TableFooter {...baseProps} rowSelection={{ actions: [] }} />);
    expect(result.queryByText('0 items selected')).not.toBeNull();
  });
  it('should render well with pagination', () => {
    const tableChangeFn = jest.fn();
    const result = render(
      <TableFooter {...baseProps} hidePagination={false} pagination={{ total: 100 }} onTableChange={tableChangeFn} />,
    );
    fireEvent.click(result.container.querySelector('[name="right"]')!);
    expect(tableChangeFn).toHaveBeenLastCalledWith({ pageNo: 2, pageSize: 10 });
    expect(result.container).isExist('.erda-pagination', 1);
  });
  it('should render well without whiteFooter', () => {
    const result = render(<TableFooter {...baseProps} whiteFooter={false} />);
    expect(result.container).not.isExistClass('.erda-table-footer', 'bg-white');
    expect(result.container).isExistClass('.erda-table-footer', 'bg-default-02');
  });
});

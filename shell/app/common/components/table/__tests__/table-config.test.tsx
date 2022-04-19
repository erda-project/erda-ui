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
import TableConfig from '../table-config';
import { ColumnProps } from '../interface';

describe('TableConfig', () => {
  const columns: ColumnProps<any>[] = [
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
      title: () => {
        return <div>title</div>;
      },
      dataIndex: 'title',
    },
  ];
  it('should render well', () => {
    const reloadFn = jest.fn();
    const setColumns = jest.fn();
    const result = render(
      <TableConfig
        columns={columns}
        onReload={reloadFn}
        setColumns={setColumns}
        sortColumn={{}}
        hideReload
        hideColumnConfig
      />,
    );
    expect(result.container).isExist('[name="refresh"]', 0);
    expect(result.container).isExist('[name="config"]', 0);
    expect(result.container).isExistClass('.erda-table-filter', 'bg-default-02');
    expect(result.container).not.isExistClass('.erda-table-filter', 'bg-white');
    result.rerender(
      <TableConfig
        columns={columns}
        onReload={reloadFn}
        setColumns={setColumns}
        sortColumn={{}}
        whiteHead
        hideReload
        hideColumnConfig
      />,
    );
    expect(result.container).not.isExistClass('.erda-table-filter', 'bg-default-02');
    expect(result.container).isExistClass('.erda-table-filter', 'bg-white');
    result.rerender(
      <TableConfig
        columns={columns}
        onReload={reloadFn}
        setColumns={setColumns}
        sortColumn={{}}
        slot={<div>slotEle</div>}
      />,
    );
    expect(result.container).isExist('[name="refresh"]', 1);
    expect(result.container).isExist('[name="config"]', 1);
    expect(result.getByText('slotEle')).toBeTruthy();
  });
  it('should work well', async () => {
    const reloadFn = jest.fn();
    const setColumns = jest.fn();
    const result = render(
      <TableConfig columns={columns} onReload={reloadFn} setColumns={setColumns} sortColumn={{}} />,
    );
    fireEvent.click(result.container.querySelector('[name="refresh"]')!);
    expect(reloadFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.container.querySelector('[name="config"]')!);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    expect(result.getAllByRole('checkbox')).toHaveLength(columns.length);
    fireEvent.click(result.getAllByRole('checkbox')[0]);
    fireEvent.change(result.getAllByRole('checkbox')[0], { target: { checked: true } });
    expect(setColumns).toHaveBeenCalledTimes(1);
    result.rerender(<TableConfig columns={columns.slice(0, 1)} onReload={reloadFn} setColumns={setColumns} />);
    expect(reloadFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.container.querySelector('[name="config"]')!);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    expect(result.getAllByRole('checkbox')).toHaveLength(1);
    expect(result.queryByRole('checkbox')?.closest('span')).toHaveClass('ant-checkbox-disabled');
  });
});

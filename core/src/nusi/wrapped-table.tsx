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
import { Table } from 'antd';
import { ColumnProps as AntdColumnProps, TableProps } from 'antd/lib/table';

const { Column, ColumnGroup, Summary } = Table;
export interface ColumnProps<recordType> extends AntdColumnProps<recordType> {
  /**
   * id\number - 72
   *
   * user\status\type\cpu\memory - 120
   *
   * email\phone\roles\ip - 160
   *
   * time - 200
   *
   * operations - 80 * n, according to the number of buttons and the number of words
   *
   * detail\content\description - No need to increase the width of the adaptive, and add the scroll.x of a certain number to the table
   *
   * All width should be at least larger than the Title in English
   */
  width?: 64 | 72 | 80 | 96 | 120 | 160 | 176 | 200 | 240 | 280 | 320;
}

interface IProps<T extends object = any> extends TableProps<T> {
  columns: Array<ColumnProps<T>>;
}

function WrappedTable<T extends object = any>({ columns, rowClassName, ...props }: IProps<T>) {
  const newColumns = columns?.map(({ ...args }: ColumnProps<T>) => ({
    ellipsis: true,
    ...args,
  }));
  return (
    <Table
      scroll={{ x: '100%' }}
      columns={newColumns}
      rowClassName={props.onRow ? `cursor-pointer ${rowClassName || ''}` : rowClassName}
      {...props}
    />
  );
}

WrappedTable.Column = Column;
WrappedTable.ColumnGroup = ColumnGroup;
WrappedTable.Summary = Summary;

export default WrappedTable;

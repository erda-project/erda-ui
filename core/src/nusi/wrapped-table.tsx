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

import * as React from 'react';
import { Table } from 'antd';
import { ColumnProps as AntdColumnProps, TableProps } from 'antd/lib/table';

export interface ColumnProps<recordType> extends AntdColumnProps<recordType> {
  /**
   * 64px对应两个中文字符，或者四个英文字符，每增加16px多增加一个中文字符或者两个英文字符
   *
   * 超过320px的列可以不写宽度来自适应，但是要加scroll.x，以免宽度太小
   */
  width?:
    | 64
    | 72
    | 80
    | 88
    | 96
    | 104
    | 112
    | 120
    | 128
    | 136
    | 144
    | 152
    | 160
    | 168
    | 176
    | 184
    | 192
    | 200
    | 208
    | 216
    | 224
    | 232
    | 240
    | 248
    | 256
    | 264
    | 272
    | 280
    | 296
    | 304
    | 312
    | 320;
}

interface IProps extends TableProps<object> {
  columns: Array<ColumnProps<object>>;
}

const WrappedTable = (({ columns, ...props }: IProps) => {
  const newColumns = columns?.map(({ width, ...args }: ColumnProps<object>) => ({
    ellipsis: true,
    ...args,
  }));
  return <Table scroll={{ x: '100%' }} columns={newColumns} {...props} />;
}) as unknown as typeof Table;

export default WrappedTable;

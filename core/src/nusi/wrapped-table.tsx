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
import { ColumnProps, TableProps } from 'antd/lib/table';

interface NewColumnsProps extends ColumnProps {
  size: string;
}

const sizeWidth: { [key: string]: number } = {
  s: 120,
  m: 240,
  l: 360,
  xl: 480,
  xxl: 600,
};

const WrappedTable = React.forwardRef(({ columns, ...props }: TableProps, ref) => {
  const newColumns = columns.map(({ size, width, ...args }: NewColumnsProps) => ({
    width: width || sizeWidth[size],
    ellipsis: !!(width || size),
    ...args,
  }));
  return <Table ref={ref} scroll={{ x: '100%' }} columns={newColumns} {...props} />;
}) as unknown as typeof Table;

export default WrappedTable;

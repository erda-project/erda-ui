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

import { GetRowKey } from 'antd/lib/table/interface';
import { BatchOperation } from 'common';
import Pagination from 'common/components/pagination';
import React from 'react';
import { IRowSelection, TablePaginationConfig } from './interface';

interface IProps<T> {
  rowKey?: string | GetRowKey<T>;
  dataSource: T[];
  pagination: TablePaginationConfig;
  hidePagination: boolean;
  onTableChange: ([key]: any) => void;
  rowSelection?: IRowSelection<T>;
  whiteFooter?: boolean;
  onSelectChange: (selectedRowKeys: Array<string | number>) => void;
}

const TableFooter = <T extends Obj>({
  rowSelection,
  pagination,
  hidePagination,
  onTableChange,
  whiteFooter,
  rowKey,
  dataSource,
  onSelectChange,
}: IProps<T>) => {
  const { actions, selectedRowKeys } = rowSelection ?? {};

  return (
    <div className={`erda-table-footer flex justify-between ${whiteFooter ? 'bg-white' : 'bg-default-02'}`}>
      {actions ? (
        <BatchOperation
          rowKey={rowKey}
          dataSource={dataSource}
          selectedKeys={selectedRowKeys}
          onSelectChange={onSelectChange}
          operations={actions}
        />
      ) : (
        <div />
      )}

      {!hidePagination && (
        <div className="flex items-center justify-end">
          <Pagination {...pagination} onChange={(page, size) => onTableChange({ pageNo: page, pageSize: size })} />
        </div>
      )}
    </div>
  );
};

export default TableFooter;

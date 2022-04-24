import React from 'react';
import { GetRowKey, TablePaginationConfig } from 'antd/lib/table/interface';
import BatchOperation from './batch-operation';
import Pagination from '../pagination';
import { usePrefixCls } from '../_util/hooks';
import cn from 'classnames';
import { RowSelection } from './interface';

interface IProps<T> {
  rowKey?: string | GetRowKey<T>;
  dataSource: T[];
  pagination: TablePaginationConfig | false;
  hidePagination: boolean;
  onTableChange: ([key]: any) => void;
  rowSelection?: RowSelection<T>;
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
  const { actions, selectedRowKeys, onChange } = rowSelection ?? {};
  const [prefixCls] = usePrefixCls('table-footer');

  const onSelectionChange = (keys: React.Key[]) => {
    onSelectChange(keys);
    onChange?.(keys, []);
  };
  return (
    <div className={cn(`${prefixCls}`, { [`${prefixCls}-white`]: whiteFooter })}>
      {actions ? (
        <BatchOperation
          rowKey={rowKey}
          dataSource={dataSource}
          selectedKeys={selectedRowKeys}
          onSelectChange={onSelectionChange}
          operations={actions}
        />
      ) : (
        <div />
      )}
      {!hidePagination && (
        <div className={`${prefixCls}-pagination`}>
          <Pagination {...pagination} onChange={(page, size) => onTableChange({ pageNo: page, pageSize: size })} />
        </div>
      )}
    </div>
  );
};

export default TableFooter;

import React from 'react';
import { Table, TableProps } from 'antd';
import cn from 'classnames';
import { usePrefixCls } from '../_util/hooks';
import { ColumnType } from 'antd/lib/table';
import TableConfigHeader from './table-config-header';
import { useErdaIcon } from '../icon';
import { RowSelection, TableRowActions } from './interface';
import { renderActions } from './utils';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import { useSorterMenu } from './sorter';
import TableFooter from './table-footer';
import { PAGINATION } from '../pagination';
import { SorterResult } from 'antd/es/table/interface';
import { useLocaleReceiver } from '../locale-provider';

export interface ErdaColumnType<T> extends ColumnType<T> {
  hidden?: boolean;
}

export interface ErdaTableProps<T = unknown> extends TableProps<T> {
  columns: Array<ErdaColumnType<T>>;
  extraConfig?: {
    tableKey?: string;
    hideHeader?: boolean;
    hideColumnConfig?: boolean;
    slot?: React.ReactNode;
    onReload?: (pageNo: number, pageSize: number) => void;
    whiteHeader?: boolean;
    whiteFooter?: boolean;
  };
  actions?: TableRowActions<T> | null;
  rowSelection?: RowSelection<T>;
}

const ErdaTable = <T extends Obj>({
  onRow,
  rowKey,
  rowClassName,
  onChange,
  dataSource,
  className,
  columns: columnsSource,
  extraConfig,
  actions,
  pagination: paginationProps,
  rowSelection,
  ...restTableProps
}: ErdaTableProps<T>) => {
  useErdaIcon();
  const [prefixCls] = usePrefixCls('table');
  const [locale] = useLocaleReceiver('Table');
  const [columns, setColumns] = React.useState(columnsSource);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState(rowSelection?.selectedRowKeys || []);

  const [defaultPagination, setDefaultPagination] = React.useState<TablePaginationConfig>({
    current: 1,
    total: dataSource?.length || 0,
    pageSizeOptions: PAGINATION.pageSizeOptions,
    pageSize: (paginationProps as TablePaginationConfig)?.pageSize || PAGINATION.pageSize,
  });
  const isFrontendPaging = !(paginationProps && paginationProps.current) && paginationProps !== false; // Determine whether front-end paging, when current is not passed means this is an uncontrolled component table

  const pagination = React.useMemo(() => {
    return isFrontendPaging ? { ...defaultPagination, ...paginationProps } : paginationProps;
  }, [defaultPagination, isFrontendPaging, paginationProps]);

  const { current = 1, pageSize = PAGINATION.pageSize } = pagination as TablePaginationConfig;

  // for backend sort
  const onSort = React.useCallback(
    (currentSorter: SorterResult<T>) => {
      if (typeof pagination === 'boolean' || !pagination || !onChange) {
        return;
      }
      onChange({ ...pagination, current: 1 }, {}, currentSorter, {
        currentDataSource: [...(dataSource ?? [])],
        action: 'sort',
      });
    },
    [dataSource, onChange, pagination],
  );
  const [renderSortTitle, sortConfig, sortCompareRef] = useSorterMenu(onSort);

  const getKey = React.useCallback(
    (item: T) => (typeof rowKey === 'function' ? rowKey(item) : item?.[rowKey || 'id']),
    [rowKey],
  );

  React.useEffect(() => {
    setSelectedRowKeys(rowSelection?.selectedRowKeys || []);
  }, [rowSelection?.selectedRowKeys]);

  const onPaginationChange = React.useCallback(
    ({ pageNo, pageSize: size }) => {
      if (typeof pagination === 'boolean' || !pagination) {
        return;
      }
      const { onChange: onPageChange } = pagination;
      const extra = {
        currentDataSource: [],
        action: 'paginate' as const,
      };

      if (isFrontendPaging) {
        setDefaultPagination({ ...pagination, current: pageNo || current, pageSize: size || pageSize });
      } else {
        onPageChange?.(pageNo || current, size || pageSize);
        onChange?.({ ...pagination, current: pageNo || current, pageSize: size || pageSize }, {}, sortConfig, extra);
      }
    },
    [current, isFrontendPaging, onChange, pageSize, pagination, sortConfig],
  );

  React.useEffect(() => {
    const _columns = columnsSource.map((col) => {
      const { width = 300, sorter, title, render, align, dataIndex, ...restColumnProps } = col;
      let sortTitle;
      if (sorter) {
        sortTitle = renderSortTitle(col);
      }

      return {
        align,
        title,
        sortTitle,
        ellipsis: true,
        onCell: () => ({
          style: { maxWidth: width },
          className: cn({ [`${prefixCls}-sort-cell`]: align === 'right' && sorter }),
        }),
        render,
        dataIndex,
        hidden: hiddenColumns.includes(dataIndex as string),
        ...restColumnProps,
      };
    });
    setColumns(_columns);
  }, [columnsSource, hiddenColumns, onPaginationChange, onSort, prefixCls, renderSortTitle, sortConfig]);

  const onReload = () => {
    if (extraConfig?.onReload) {
      extraConfig.onReload(current, pageSize);
    } else {
      const { onChange: onPageChange } = pagination as TablePaginationConfig;
      onChange?.({ current, pageSize }, {}, sortConfig, { action: 'paginate', currentDataSource: [] });
      onPageChange?.(current, pageSize);
    }
  };

  const hideReload = !extraConfig?.onReload && !onChange;

  let data = [...(dataSource ?? [])];

  if (sortCompareRef.current) {
    data = data.sort(sortCompareRef.current);
  }

  if (isFrontendPaging) {
    data = data.slice((current - 1) * pageSize, current * pageSize);
  }

  return (
    <div className={cn(`${prefixCls}`, { [`${prefixCls}-hide-header`]: extraConfig?.hideHeader })}>
      {!extraConfig?.hideHeader && (
        <TableConfigHeader
          slotNode={extraConfig?.slot}
          hideColumnConfig={extraConfig?.hideColumnConfig}
          hideReload={hideReload}
          columns={columns}
          setHiddenColumns={setHiddenColumns}
          onReload={onReload}
          whiteHeader={extraConfig?.whiteHeader}
          tableKey={extraConfig?.tableKey}
        />
      )}
      <Table
        rowKey={rowKey}
        scroll={{ x: '100%' }}
        columns={[
          ...columns.filter((item) => !item.hidden).map((item) => ({ ...item, title: item.title })),
          ...renderActions(prefixCls, locale, actions),
        ]}
        rowClassName={cn({ 'cursor-pointer': onRow }, rowClassName)}
        size="small"
        pagination={false}
        onChange={onChange}
        dataSource={data ?? []}
        onRow={onRow}
        rowSelection={
          rowSelection
            ? {
                ...rowSelection,
                selectedRowKeys,
                onChange(selectedRowKeyList, selectedRows) {
                  rowSelection.onChange?.(selectedRowKeyList, selectedRows);
                  setSelectedRowKeys(() => selectedRows.map((r) => getKey(r)));
                },
              }
            : undefined
        }
        className={cn(`${prefixCls}-content`, className)}
        tableLayout="auto"
        locale={{
          emptyText:
            typeof pagination !== 'boolean' && (!pagination?.current || pagination?.current === 1) ? null : (
              <span>
                {locale.emptyText}
                <span className="link" onClick={() => onPaginationChange({ pageNo: 1 })}>
                  {locale.firstPage}
                </span>
              </span>
            ),
        }}
        {...restTableProps}
      />
      <TableFooter
        rowKey={rowKey}
        dataSource={data}
        onSelectChange={setSelectedRowKeys}
        rowSelection={{
          ...rowSelection,
          selectedRowKeys,
        }}
        pagination={pagination}
        hidePagination={paginationProps === false}
        onTableChange={onPaginationChange}
        whiteFooter={extraConfig?.whiteFooter}
      />
    </div>
  );
};

export default ErdaTable;

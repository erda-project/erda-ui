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
import { Dropdown, Menu } from 'antd';
import Table from 'antd/es/table';
import { Ellipsis, ErdaIcon } from 'common';
import { WithAuth } from 'user/common';
import { firstCharToUpper } from 'app/common/utils';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import TableConfig from './table-config';
import TableFooter from './table-footer';

import './index.scss';

import {
  ColumnProps,
  IActions,
  IRowSelection,
  SorterResult,
  TableAction,
  TablePaginationConfig,
  TableProps,
} from './interface';

const { Column, ColumnGroup, Summary } = Table;

export interface IProps<T extends object = any> extends TableProps<T> {
  columns: Array<ColumnProps<T>>;
  actions?: IActions<T> | null;
  slot?: React.ReactNode;
  rowSelection?: IRowSelection<T>;
  theme?: 'dark' | 'light';
  hideHeader?: boolean;
  onReload?: (pageNo: number, pageSize: number) => void;
  className?: string;
  wrapperClassName?: string;
  hideReload?: boolean;
  hideColumnConfig?: boolean;
  whiteFooter?: boolean;
  whiteHead?: boolean;
  tableKey?: string;
}

interface ColumnsConfig {
  [key: string]: {
    dataIndex: string;
    hidden: boolean;
  };
}

const sortIcon = {
  ascend: <ErdaIcon type="ascend" size={16} />,
  descend: <ErdaIcon type="descend" size={16} />,
};

const alignMap = {
  center: 'justify-center',
  left: 'justify-start',
  right: 'justify-end',
};

const saveColumnsConfig = (key: string, config: ColumnsConfig) => {
  localStorage.setItem(`table-key-${key}`, JSON.stringify(config));
};

const getColumnsConfig = (key: string) => {
  const str = localStorage.getItem(`table-key-${key}`);
  return str ? JSON.parse(str) : {};
};

function WrappedTable<T extends object = any>({
  columns: allColumns,
  rowClassName,
  actions,
  pagination: paginationProps,
  onChange,
  onReload: onReloadProps,
  slot,
  dataSource: ds,
  onRow,
  rowSelection,
  hideHeader,
  hideReload,
  hideColumnConfig,
  rowKey,
  theme = 'light',
  className,
  wrapperClassName = '',
  whiteFooter = false,
  whiteHead = false,
  tableKey,
  ...props
}: IProps<T>) {
  const dataSource = React.useMemo<T[]>(() => (ds as T[]) || [], [ds]);
  const [columns, setColumns] = React.useState<Array<ColumnProps<T>>>(allColumns);
  const columnsConfig = React.useRef(tableKey ? getColumnsConfig(tableKey) : {});
  const [sort, setSort] = React.useState<SorterResult<T>>({});
  const [selectedRowKeys, setSelectedRowKeys] = React.useState(rowSelection?.selectedRowKeys || []);
  const sortCompareRef = React.useRef<((a: T, b: T) => number) | null>(null);
  const preDataSourceRef = React.useRef<T[]>([]);
  const [defaultPagination, setDefaultPagination] = React.useState<TablePaginationConfig>({
    current: 1,
    total: dataSource.length || 0,
    pageSizeOptions: PAGINATION.pageSizeOptions,
    pageSize: (paginationProps as TablePaginationConfig)?.pageSize || PAGINATION.pageSize,
  });
  const isFrontendPaging = !(paginationProps && paginationProps.current) && paginationProps !== false; // Determine whether front-end paging

  const pagination: TablePaginationConfig = React.useMemo(
    () =>
      isFrontendPaging ? { ...defaultPagination, ...paginationProps } : (paginationProps as TablePaginationConfig),
    [defaultPagination, paginationProps, isFrontendPaging],
  );
  const { current = 1, pageSize = PAGINATION.pageSize } = pagination;

  const containerRef = React.useRef<HTMLElement>(document.body);
  const getKey = React.useCallback(
    (item: T) => (typeof rowKey === 'function' ? rowKey(item) : item?.[rowKey || 'id']),
    [rowKey],
  );

  React.useEffect(() => {
    if (isFrontendPaging) {
      const newRowKeys = dataSource.map(getKey) || [];
      const preRowKeys = preDataSourceRef.current.map(getKey) || [];
      if (newRowKeys.join(',') !== preRowKeys.join(',')) {
        setDefaultPagination((before) => ({ ...before, current: 1, total: dataSource.length || 0 }));
      }

      preDataSourceRef.current = [...dataSource];
    }
  }, [dataSource, rowKey, isFrontendPaging, getKey]);

  React.useEffect(() => {
    setSelectedRowKeys(rowSelection?.selectedRowKeys || []);
  }, [rowSelection?.selectedRowKeys]);

  const onTableChange = React.useCallback(
    ({ pageNo, pageSize: size, sorter: currentSorter }) => {
      const { onChange: onPageChange } = pagination as TablePaginationConfig;
      const action: TableAction = currentSorter ? 'sort' : 'paginate';
      const extra = {
        currentDataSource: (action === 'sort' && dataSource) || [],
        action,
      };

      switch (action) {
        case 'paginate':
          if (isFrontendPaging) {
            setDefaultPagination({ ...pagination, current: pageNo || current, pageSize: size || pageSize });
          } else {
            onPageChange?.(pageNo || current, size || pageSize);
            onChange?.(
              { ...pagination, current: pageNo || current, pageSize: size || pageSize },
              {},
              currentSorter || sort,
              extra,
            );
          }
          break;
        case 'sort':
          if (!sortCompareRef.current) {
            onChange?.(
              { ...pagination, current: pageNo || current, pageSize: size || pageSize },
              {},
              currentSorter || sort,
              extra,
            );
          }
          break;
        default:
          break;
      }
    },
    [dataSource, onChange, pagination, sort, setDefaultPagination, current, pageSize, isFrontendPaging],
  );

  const sorterMenu = React.useCallback(
    (column: ColumnProps<T>) => {
      const sorter = {
        column,
        columnKey: column.dataIndex,
        field: column.dataIndex,
      } as SorterResult<T>;
      const onSort = (order?: 'ascend' | 'descend') => {
        setSort({ ...sorter, order });
        const { sorter: columnSorter } = column as {
          sorter: { compare: (a: T, b: T) => number } | ((a: T, b: T) => number);
        };
        if (order && columnSorter?.compare) {
          sortCompareRef.current = (a: T, b: T) => {
            if (order === 'ascend') {
              return columnSorter?.compare?.(a, b);
            } else {
              return columnSorter?.compare?.(b, a);
            }
          };
        } else if (order && typeof columnSorter === 'function') {
          sortCompareRef.current = (a: T, b: T) => {
            if (order === 'ascend') {
              return columnSorter?.(a, b);
            } else {
              return columnSorter?.(b, a);
            }
          };
        } else {
          sortCompareRef.current = null;
        }
        onTableChange({ pageNo: 1, sorter: { ...sorter, order } });
      };

      return (
        <Menu>
          <Menu.Item key={'0'} onClick={() => onSort()}>
            <span className="fake-link mr-1">{i18n.t('Unsort')}</span>
          </Menu.Item>
          <Menu.Item key={'ascend'} onClick={() => onSort('Ascending')}>
            <span className="fake-link mr-1">
              <ErdaIcon type="ascend" className="relative top-0.5 mr-1" />
              {i18n.t('Ascending')}
            </span>
          </Menu.Item>
          <Menu.Item key={'descend'} onClick={() => onSort('Descending')}>
            <span className="fake-link mr-1">
              <ErdaIcon type="descend" className="relative top-0.5 mr-1" />
              {i18n.t('Descending')}
            </span>
          </Menu.Item>
        </Menu>
      );
    },
    [onTableChange],
  );

  React.useEffect(() => {
    const _columnsConfig = {};
    const _columns = allColumns.map(
      ({
        width = 300,
        sorter,
        title,
        render,
        icon,
        align,
        show,
        dataIndex,
        hidden = false,
        ...args
      }: ColumnProps<T>) => {
        const _columnConfig = columnsConfig.current[dataIndex] || { dataIndex, hidden: show === false || hidden };
        _columnsConfig[dataIndex] = _columnConfig;
        const { subTitle } = args;
        let sortTitle;
        if (sorter) {
          sortTitle = (
            <Dropdown
              trigger={['click']}
              overlay={sorterMenu({ ...args, title, sorter, dataIndex })}
              align={{ offset: [0, 5] }}
              overlayClassName="erda-table-sorter-overlay"
              placement={align === 'right' ? 'bottomRight' : 'bottomLeft'}
              getPopupContainer={() => containerRef.current}
            >
              <span
                className={`cursor-pointer erda-table-sorter flex items-center ${(align && alignMap[align]) || ''}`}
              >
                {typeof title === 'function'
                  ? title({ sortColumn: sort?.column, sortOrder: sort?.order })
                  : firstCharToUpper(title)}
                <span className={`sorter-icon pl-1 ${(sort.columnKey === dataIndex && sort.order) || ''}`}>
                  {sort.order && sort.columnKey === dataIndex ? (
                    sortIcon[sort.order]
                  ) : (
                    <ErdaIcon type="caret-down" fill="log-font" size={20} className="relative top-0.5" />
                  )}
                </span>
              </span>
            </Dropdown>
          );
        }

        let columnRender = render;
        if (icon || subTitle) {
          columnRender = (text: string, record: T, index: number) => {
            const displayedText = render ? render(text, record, index) : text;
            const subTitleText = typeof subTitle === 'function' ? subTitle(text, record, index) : subTitle;

            return (
              <div
                className={`
                    erda-table-compose-td flex items-center
                    ${icon ? 'erda-table-icon-td' : ''}
                    ${(Object.keys(args).includes('subTitle') && 'double-row') || ''}
                  `}
              >
                {icon && (
                  <span className="erda-table-td-icon mr-1 flex">
                    {typeof icon === 'function' ? icon(text, record, index) : icon}
                  </span>
                )}
                <div className="flex flex-col">
                  <Ellipsis
                    title={<span className={onRow && subTitle ? 'erda-table-td-title' : ''}>{displayedText}</span>}
                    className="leading-4"
                  />
                  {Object.keys(args).includes('subTitle') && (
                    <span className="erda-table-td-subTitle truncate">{subTitleText || '-'}</span>
                  )}
                </div>
              </div>
            );
          };
        }

        return {
          align,
          title,
          sortTitle,
          ellipsis: true,
          onCell: () => ({ style: { maxWidth: width }, className: align === 'right' && sorter ? 'pr-8' : '' }),
          render: columnRender,
          dataIndex,
          ...args,
          hidden: _columnConfig.hidden,
        };
      },
    );

    columnsConfig.current = _columnsConfig;
    setColumns(_columns);
    tableKey && saveColumnsConfig(tableKey, _columnsConfig);
  }, [allColumns, sorterMenu, sort, onRow, tableKey]);

  const onReload = () => {
    if (onReloadProps) {
      onReloadProps(current, pageSize);
    } else {
      const { onChange: onPageChange } = pagination as TablePaginationConfig;
      onChange?.({ current, pageSize }, {}, sort, { action: 'paginate', currentDataSource: [] });
      onPageChange?.(current, pageSize);
    }
  };

  let data = [...dataSource];

  if (sortCompareRef.current) {
    data = data.sort(sortCompareRef.current);
  }

  if (isFrontendPaging) {
    data = data.slice((current - 1) * pageSize, current * pageSize);
  }
  return (
    <div
      className={`flex flex-col erda-table bg-white ${
        hideHeader ? 'hide-header' : ''
      } theme-${theme} ${wrapperClassName}`}
      ref={containerRef}
    >
      {!hideHeader && (
        <TableConfig
          slot={slot}
          hideColumnConfig={hideColumnConfig}
          hideReload={hideReload}
          columns={columns}
          sortColumn={sort}
          setColumns={(val) => {
            val.forEach((item) => {
              columnsConfig.current[item.dataIndex].hidden = item.hidden;
            });

            tableKey && saveColumnsConfig(tableKey, columnsConfig.current);
            setColumns(val);
          }}
          onReload={onReload}
          whiteHead={whiteHead}
        />
      )}

      <Table
        rowKey={rowKey}
        scroll={{ x: '100%' }}
        columns={[
          ...columns
            .filter((item) => !item.hidden)
            .map((item) => ({ ...item, title: firstCharToUpper(item.sortTitle || item.title) })),
          ...renderActions(actions),
        ]}
        rowClassName={onRow ? `cursor-pointer ${rowClassName || ''}` : rowClassName}
        size="small"
        pagination={false}
        onChange={onChange}
        dataSource={data}
        onRow={onRow}
        rowSelection={
          rowSelection
            ? {
                ...rowSelection,
                selectedRowKeys,
                onChange(selectedRowKeyList, selectedRows) {
                  rowSelection?.onChange?.(selectedRowKeyList, selectedRows);
                  setSelectedRowKeys(() => selectedRows.map((r) => getKey(r)));
                },
              }
            : undefined
        }
        {...props}
        className={`flex-1 overflow-y-auto ${className}`}
        tableLayout="auto"
        locale={{
          emptyText:
            !pagination?.current || pagination?.current === 1 ? null : (
              <span>
                {i18n.t('This page has no data, whether to go')}
                <span className="fake-link ml-1" onClick={() => onTableChange({ pageNo: 1 })}>
                  {i18n.t('page 1')}
                </span>
              </span>
            ),
        }}
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
        onTableChange={onTableChange}
        whiteFooter={whiteFooter}
      />
    </div>
  );
}

function renderActions<T extends object = any>(actions?: IActions<T> | null): Array<ColumnProps<T>> {
  if (actions) {
    const { render } = actions;
    return [
      {
        title: i18n.t('Operations'),
        width: 100,
        dataIndex: 'operation',
        fixed: 'right',
        render: (_: any, record: T) => {
          const list = render(record).filter((item) => item.show !== false);

          const menu = (
            <Menu theme="dark">
              {list.map((item) => {
                const { title, onClick, disabled = false, disableAuthTip } = item;
                return (
                  <Menu.Item key={title} onClick={disabled ? undefined : onClick} className="text-white-9">
                    <WithAuth pass={!disabled} noAuthTip={disableAuthTip}>
                      <span className="fake-link mr-1">{title}</span>
                    </WithAuth>
                  </Menu.Item>
                );
              })}
            </Menu>
          );

          return (
            <span className="operate-list" onClick={(e) => e.stopPropagation()}>
              {!!list.length && (
                <Dropdown overlay={menu} align={{ offset: [0, 5] }} trigger={['click']}>
                  <ErdaIcon type="more" className="cursor-pointer p-1 bg-hover rounded-sm" />
                </Dropdown>
              )}
            </span>
          );
        },
      },
    ];
  } else {
    return [];
  }
}

WrappedTable.Column = Column;
WrappedTable.ColumnGroup = ColumnGroup;
WrappedTable.Summary = Summary;

export default WrappedTable;

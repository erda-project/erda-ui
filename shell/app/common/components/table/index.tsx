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
import { ErdaIcon, Ellipsis } from 'common';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import TableConfig from './table-config';
import TableFooter from './table-footer';

import './index.scss';

import {
  TableProps,
  ColumnProps,
  IActions,
  IRowSelection,
  SorterResult,
  TablePaginationConfig,
  TableAction,
} from './interface';

const { Column, ColumnGroup, Summary } = Table;

interface IProps<T extends object = any> extends TableProps<T> {
  columns: Array<ColumnProps<T>>;
  actions?: IActions<T> | null;
  slot?: React.ReactNode;
  rowSelection?: IRowSelection<T>;
  hideHeader?: boolean;
}

const sortIcon = {
  ascend: <ErdaIcon type="ascend" size={16} />,
  descend: <ErdaIcon type="descend" size={16} />,
};

function WrappedTable<T extends object = any>({
  columns: allColumns,
  rowClassName,
  actions,
  pagination: paginationProps,
  onChange,
  slot,
  dataSource = [],
  onRow,
  rowSelection,
  hideHeader,
  ...props
}: IProps<T>) {
  const [columns, setColumns] = React.useState<Array<ColumnProps<T>>>(allColumns);
  const [sort, setSort] = React.useState<SorterResult<T>>({});
  const sortCompareRef = React.useRef() as { current: (a: T, b: T) => number };
  const [defaultPagination, setDefaultPagination] = React.useState<TablePaginationConfig>({
    current: 1,
    total: dataSource.length,
    ...PAGINATION,
  });

  const pagination: TablePaginationConfig =
    paginationProps && paginationProps.current ? paginationProps : defaultPagination;
  const { current = 1, pageSize = PAGINATION.pageSize } = pagination;

  React.useEffect(() => {
    setDefaultPagination((before) => ({ ...before, current: 1, total: dataSource.length }));
  }, [dataSource]);

  const onTableChange = React.useCallback(
    ({ pageNo, pageSize: size, sorter: currentSorter }) => {
      const { onChange: onPageChange } = pagination as TablePaginationConfig;
      const extra = {
        currentDataSource: dataSource as T[],
        action: 'sort' as TableAction,
      };

      onPageChange?.(pageNo, pageSize);
      onChange?.(
        { ...pagination, current: pageNo || current, pageSize: size || pageSize },
        {},
        currentSorter || sort,
        extra,
      );

      if (!onPageChange && !onChange) {
        setDefaultPagination({ ...pagination, current: pageNo || current, pageSize: size || pageSize });
      }
    },
    [dataSource, onChange, pagination, sort, setDefaultPagination, current, pageSize],
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
        const { sorter: columnSorter } = column as { sorter: { compare: (a: T, b: T) => number } };
        if (columnSorter?.compare) {
          sortCompareRef.current = (a: T, b: T) => {
            if (order === 'ascend') {
              return columnSorter?.compare?.(a, b);
            } else {
              return columnSorter?.compare?.(b, a);
            }
          };
        }
        onTableChange({ pageNo: 1, sorter: { ...sorter, order } });
      };

      return (
        <Menu>
          <Menu.Item key={'0'} onClick={() => onSort()}>
            <span className="fake-link mr-1">{i18n.t('cancel order')}</span>
          </Menu.Item>
          <Menu.Item key={'ascend'} onClick={() => onSort('ascend')}>
            <span className="fake-link mr-1">
              <ErdaIcon type="ascend" className="relative top-0.5 mr-1" />
              {i18n.t('ascend')}
            </span>
          </Menu.Item>
          <Menu.Item key={'descend'} onClick={() => onSort('descend')}>
            <span className="fake-link mr-1">
              <ErdaIcon type="descend" className="relative top-0.5 mr-1" />
              {i18n.t('descend')}
            </span>
          </Menu.Item>
        </Menu>
      );
    },
    [onTableChange],
  );

  React.useEffect(() => {
    setColumns(
      allColumns.map(({ width = 300, sorter, title, render, icon, align, ...args }: ColumnProps<T>) => {
        const { subTitle } = args;
        let sortTitle;
        if (sorter) {
          sortTitle = (
            <Dropdown
              trigger={['click']}
              overlay={sorterMenu({ ...args, title, sorter })}
              align={{ offset: [0, 5] }}
              overlayClassName="erda-table-sorter-overlay"
              getPopupContainer={(triggerNode) => triggerNode.parentElement?.parentElement as HTMLElement}
            >
              <span className="cursor-pointer erda-table-sorter">
                {typeof title === 'function' ? title({ sortColumn: sort?.column, sortOrder: sort?.order }) : title}
                <span className={`sorter-icon pl-1 ${(sort.columnKey === args.dataIndex && sort.order) || ''}`}>
                  {sort.order && sort.columnKey === args.dataIndex ? (
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
                    className="leading-none"
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
          show: true,
          ...args,
        };
      }),
    );
  }, [allColumns, sorterMenu, sort, onRow]);

  let data = dataSource as T[];

  if (sortCompareRef.current) {
    data = data.sort(sortCompareRef.current);
  }

  if (!(paginationProps && paginationProps.current) && paginationProps !== false) {
    data = data.slice((current - 1) * pageSize, current * pageSize);
  }

  return (
    <div className={`erda-table ${hideHeader ? 'hide-header' : ''}`}>
      {!hideHeader && (
        <TableConfig
          slot={slot}
          columns={columns}
          sortColumn={sort}
          setColumns={(val) => setColumns(val)}
          onTableChange={onTableChange}
          showReset={!!(onChange || (paginationProps && paginationProps.onChange))}
        />
      )}

      <Table
        scroll={{ x: '100%' }}
        columns={[
          ...columns.filter((item) => item.show).map((item) => ({ ...item, title: item.sortTitle || item.title })),
          ...renderActions(actions),
        ]}
        rowClassName={onRow ? `cursor-pointer ${rowClassName || ''}` : rowClassName}
        size="small"
        pagination={false}
        onChange={onChange}
        dataSource={data}
        onRow={onRow}
        rowSelection={rowSelection}
        {...props}
        tableLayout="auto"
        locale={{
          emptyText:
            pagination?.current === 1 ? null : (
              <span>
                {i18n.t('This page has no data, whether to go ')}
                <span className="fake-link " onClick={() => onTableChange({ pageNo: 1 })}>
                  {i18n.t('page 1')}
                </span>
              </span>
            ),
        }}
      />
      <TableFooter
        rowSelection={rowSelection}
        pagination={pagination}
        hidePagination={paginationProps === false}
        onTableChange={onTableChange}
      />
    </div>
  );
}

function renderActions<T extends object = any>(actions?: IActions<T> | null): Array<ColumnProps<T>> {
  if (actions) {
    const { width, render } = actions;
    return [
      {
        title: i18n.t('operation'),
        width,
        dataIndex: 'operation',
        ellipsis: true,
        fixed: 'right',
        render: (_: any, record: T) => {
          const list = render(record);

          const menu = (
            <Menu>
              {list.map((item) => (
                <Menu.Item key={item.title} onClick={item.onClick}>
                  <span className="fake-link mr-1">{item.title}</span>
                </Menu.Item>
              ))}
            </Menu>
          );

          return (
            <span className="operate-list">
              <Dropdown overlay={menu} align={{ offset: [0, 5] }} trigger={['click']}>
                <ErdaIcon type="more" className="cursor-pointer p-1 bg-hover rounded-sm" />
              </Dropdown>
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

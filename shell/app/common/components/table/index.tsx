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
import { Dropdown, Menu, Popover, Input, Checkbox, Button, Pagination } from 'antd';
import Table, { ColumnProps as AntdColumnProps, TableProps } from 'antd/es/table';
import { SorterResult, TablePaginationConfig } from 'antd/es/table/interface';
import { ErdaIcon, Ellipsis, Icon } from 'common';
import i18n from 'i18n';
import { produce } from 'immer';

import './index.scss';

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
  width?: IWidth;
}

type IWidth = 64 | 72 | 80 | 96 | 120 | 160 | 176 | 200 | 240 | 280 | 320;

interface IProps<T extends object = any> extends TableProps<T> {
  columns: Array<IColumnProps<T>>;
  actions?: IActions<T>;
  filter?: React.ReactNode;
}

export interface IColumnProps<T> extends ColumnProps<T> {
  subTitle?: (text: string, record: T, index: number) => React.ReactNode | React.ReactNode;
  icon?: (text: string, record: T, index: number) => React.ReactNode | React.ReactNode;
  show?: boolean;
  sortTitle?: React.ReactNode;
}

export interface IActions<T> {
  width: IWidth;
  /**
   * (record: T) => IAction[]
   *
   * interface IAction {
   *   title: string;
   *   onClick: () => void;
   * }
   */
  render: (record: T) => IAction[];
  /**
   * Limit the number of displays
   */
  limitNum?: number;
}

interface IAction {
  title: string;
  onClick: () => void;
}

interface ITableFilterProps<T> {
  filter?: React.ReactNode;
  columns: Array<IColumnProps<T>>;
  setColumns: (val: Array<IColumnProps<T>>) => void;
  onTableChange: ([key]: any) => void;
}

declare type TableAction = 'paginate' | 'sort' | 'filter';

const sortIcon = {
  ascend: <ErdaIcon type="ascend" size={16} />,
  descend: <ErdaIcon type="descend" size={16} />,
};

function WrappedTable<T extends object = any>({
  columns: allColumns,
  rowClassName,
  actions,
  pagination,
  onChange,
  filter,
  dataSource = [],
  onRow,
  ...props
}: IProps<T>) {
  const [columns, setColumns] = React.useState<Array<IColumnProps<T>>>(allColumns);
  const [sort, setSort] = React.useState<SorterResult<T>>({});

  const onTableChange = React.useCallback(
    ({ pageNo, pageSize: size, sorter: currentSorter }) => {
      const { current, pageSize, onChange: onPageChange } = pagination as TablePaginationConfig;
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
    },
    [dataSource, onChange, pagination, sort],
  );

  const sorterMenu = React.useCallback(
    (column: IColumnProps<T>) => {
      const sorter = {
        column,
        columnKey: column.dataIndex,
        field: column.dataIndex,
      } as SorterResult<T>;

      const onSort = (order?: 'ascend' | 'descend') => {
        setSort({ ...sorter, order });
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
      allColumns.map(({ width, sorter, title, render, icon, subTitle, ...args }: IColumnProps<T>) => {
        let sortTitle;
        if (sorter) {
          sortTitle = (
            <Dropdown
              trigger={['click']}
              overlay={sorterMenu({ ...args, title })}
              align={{ offset: [0, 5] }}
              overlayClassName="erda-table-sorter-overlay"
              getPopupContainer={(triggerNode) => triggerNode.parentElement?.parentElement as HTMLElement}
            >
              <span className="cursor-pointer erda-table-sorter">
                {title}
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
              <div className="erda-table-icon-td flex items-center">
                {icon && (
                  <span className="erda-table-td-icon mr-1">
                    {typeof icon === 'function' ? icon(text, record, index) : icon}
                  </span>
                )}
                <div className="flex flex-col">
                  <Ellipsis
                    title={<span className={onRow ? 'erda-table-td-title' : ''}>{displayedText}</span>}
                    className="leading-none"
                  />
                  {subTitleText ? <span className="erda-table-td-subTitle">{subTitleText}</span> : ''}
                </div>
              </div>
            );
          };
        }

        return {
          title,
          sortTitle,
          ellipsis: true,
          onCell: () => ({ style: { maxWidth: width } }),
          render: columnRender,
          show: true,
          ...args,
        };
      }),
    );
  }, [allColumns, sorterMenu, sort, onRow]);

  const paginationCenterRender = (
    <Popover
      content={<PaginationJump pagination={pagination} onTableChange={onTableChange} />}
      trigger="click"
      getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
      placement="top"
      overlayClassName="pagination-jump"
    >
      <div className="pagination-center bg-hover mx-1 px-3 rounded" onClick={(e) => e.stopPropagation()}>
        {pagination?.current} / {Math.ceil(pagination?.total / pagination?.pageSize)}
      </div>
    </Popover>
  );

  const paginationItemRender = (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    originalElement: React.ReactElement<HTMLElement>,
  ) => {
    switch (type) {
      case 'prev':
      case 'next':
        return <div className="bg-hover">{originalElement}</div>;
      case 'page':
        if (page === 1) {
          return paginationCenterRender;
        }
        return null;
      default:
        return null;
    }
  };

  const pageSizeMenu = (
    <Menu>
      {(pagination?.pageSizeOptions || Pagination?.defaultProps?.pageSizeOptions || []).map((item: number) => {
        return (
          <Menu.Item key={item} onClick={() => onTableChange({ pageNo: 1, pageSize: item })}>
            <span className="fake-link mr-1">{i18n.t('{size} items / page', { size: item })}</span>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className="erda-table">
      <TableFilter
        filter={filter}
        columns={columns}
        setColumns={(val) => setColumns(val)}
        onTableChange={onTableChange}
      />
      <Table
        scroll={{ x: '100%' }}
        columns={[
          ...columns.filter((item) => item.show).map((item) => ({ ...item, title: item.sortTitle || item.title })),
          ...renderActions(actions),
        ]}
        rowClassName={props.onRow ? `cursor-pointer ${rowClassName || ''}` : rowClassName}
        size="small"
        pagination={false}
        onChange={onChange}
        dataSource={dataSource}
        onRow={onRow}
        {...props}
        tableLayout="auto"
      />
      {pagination && (
        <div className="erda-pagination flex items-center justify-end">
          <Pagination
            onChange={(pageNo, pageSize) => onTableChange({ pageNo, pageSize })}
            {...pagination}
            showSizeChanger={false}
            size="small"
            itemRender={paginationItemRender}
          />
          <Dropdown
            trigger={['click']}
            overlay={pageSizeMenu}
            align={{ offset: [0, 5] }}
            overlayStyle={{ minWidth: 120 }}
            getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
          >
            <span className="bg-hover px-2">{i18n.t('{size} items / page', { size: pagination.pageSize })}</span>
          </Dropdown>
        </div>
      )}
    </div>
  );
}

function TableFilter<T extends object = any>({ filter, columns, setColumns, onTableChange }: ITableFilterProps<T>) {
  const onCheck = (checked: boolean, title: string) => {
    const newColumns = produce(columns, (draft) => {
      draft.forEach((item, index) => {
        if (item.title === title) {
          draft[index] = { ...item, show: checked };
        }
      });
    });

    setColumns(newColumns);
  };

  const columnsFilter = columns
    .filter((item) => item.title)
    .map((item: IColumnProps<T>) => (
      <div>
        <Checkbox
          className="whitespace-nowrap"
          checked={item.show}
          onChange={(e) => onCheck(e.target.checked, item.title as string)}
        >
          {item.title}
        </Checkbox>
      </div>
    ));

  return (
    <div className="erda-table-filter flex justify-between">
      <div className="erda-table-filter-content flex-1 flex items-center">
        <div className="flex-1">{filter}</div>
      </div>
      <div className="erda-table-filter-ops flex items-center">
        <ErdaIcon size="16" className={`ml-3 bg-hover p-2`} type="redo" onClick={() => onTableChange({ pageNo: 1 })} />
        <Popover
          content={columnsFilter}
          trigger="click"
          placement="bottom"
          overlayClassName="erda-table-columns-filter"
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <Icon
            type="config"
            // style={{ color: '#817b8e' }}
            className={`ml-3 bg-hover p-2 relative bottom-0.5`}
          />
        </Popover>
      </div>
    </div>
  );
}

const PaginationJump = ({ pagination, onTableChange }) => {
  const { total } = pagination;
  const [value, setValue] = React.useState('');

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: val } = e.target;
      if (!isNaN(Number(val)) && +val <= total && +val > 0 && !val.includes('.')) {
        setValue(val);
      } else if (!val) {
        setValue('');
      }
    },
    [setValue, total],
  );

  const jump = () => {
    if (value) {
      onTableChange({ pageNo: value });
    }
  };

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      {i18n.t('Go to page')}
      <Input className="mx-2" style={{ width: 80 }} value={value} onChange={handleChange} onPressEnter={jump} />
      <Button
        type="primary"
        size="small"
        icon={<ErdaIcon type="enter" onClick={jump} fill="white" className="relative top-0.5" />}
      />
    </div>
  );
};

function renderActions<T extends object = any>(actions?: IActions<T>): Array<IColumnProps<T>> {
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
              <Dropdown overlay={menu} align={{ offset: [0, 5] }}>
                <ErdaIcon type="more" />
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

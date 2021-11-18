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
import { Dropdown, Button, Menu, Pagination, Popover, Input } from 'antd';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import { IRowSelection, IRowActions, TablePaginationConfig, IPaginationProps } from './interface';

interface IProps {
  rowSelection?: IRowSelection;
  pagination: TablePaginationConfig;
  hidePagination: boolean;
  onTableChange: ([key]: any) => void;
}

const TableFooter = ({ rowSelection, pagination, hidePagination, onTableChange }: IProps) => {
  const { current = 1, pageSize = PAGINATION.pageSize, pageSizeOptions = PAGINATION.pageSizeOptions } = pagination;
  const [goToVisible, setGoToVisible] = React.useState(false);

  const batchMenu = () => {
    return (
      <Menu>
        {(rowSelection?.actions || []).map((item: IRowActions) => {
          return (
            <Menu.Item key={item.key} onClick={() => item.onClick()} disabled={item.disabled}>
              {item.name}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  const paginationCenterRender = (
    <Popover
      content={
        <PaginationJump
          pagination={pagination}
          onTableChange={onTableChange}
          hiddenPopover={() => setGoToVisible(false)}
        />
      }
      trigger="click"
      getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
      placement="top"
      overlayClassName="pagination-jump"
      visible={goToVisible}
      onVisibleChange={setGoToVisible}
    >
      <div className="pagination-center bg-hover mx-1 px-3 rounded" onClick={() => setGoToVisible(true)}>
        {pagination.total ? pagination.current : 0} /{' '}
        {(pagination.total && pagination.pageSize && Math.ceil(pagination.total / pagination.pageSize)) || 0}
      </div>
    </Popover>
  );

  const paginationItemRender = (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    originalElement: React.ReactElement<HTMLElement>,
  ) => {
    const { total } = pagination;
    switch (type) {
      case 'prev':
        return (
          <div className="bg-hover" onClick={() => current > 1 && onTableChange({ pageNo: current - 1 })}>
            {originalElement}
          </div>
        );
      case 'next':
        return (
          <div
            className="bg-hover"
            onClick={() => total && current < Math.ceil(total / pageSize) && onTableChange({ pageNo: current + 1 })}
          >
            {originalElement}
          </div>
        );
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
      {(pageSizeOptions || []).map((item: string | number) => {
        return (
          <Menu.Item key={item} onClick={() => onTableChange({ pageNo: 1, pageSize: item })}>
            <span className="fake-link mr-1">{i18n.t('{size} items / page', { size: item })}</span>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className="erda-table-footer flex justify-between">
      {rowSelection?.actions ? (
        <div className="erda-table-batch-ops flex items-center">
          <Dropdown
            overlay={batchMenu}
            trigger={['click']}
            disabled={rowSelection.selectedRowKeys?.length === 0}
            getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
          >
            <Button type="default">
              {i18n.t('dop:batch processing')}
              <ErdaIcon
                type="caret-down"
                className="ml-0.5 relative top-0.5"
                fill={rowSelection.selectedRowKeys?.length === 0 ? 'disabled' : 'normal'}
                size="14"
              />
            </Button>
          </Dropdown>
        </div>
      ) : (
        <div />
      )}

      {!hidePagination && (
        <div className="erda-pagination flex items-center justify-end">
          <Pagination {...pagination} showSizeChanger={false} size="small" itemRender={paginationItemRender} />
          {pageSizeOptions?.length && (
            <Dropdown
              trigger={['click']}
              overlay={pageSizeMenu}
              align={{ offset: [0, 5] }}
              overlayStyle={{ minWidth: 120 }}
              getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
            >
              <span className="bg-hover px-3">{i18n.t('{size} items / page', { size: pageSize })}</span>
            </Dropdown>
          )}
        </div>
      )}
    </div>
  );
};

const PaginationJump = ({ pagination, onTableChange, hiddenPopover }: IPaginationProps) => {
  const { total = 0, pageSize = PAGINATION.pageSize } = pagination;
  const [value, setValue] = React.useState('');

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: val } = e.target;
      if (!isNaN(Number(val)) && +val <= Math.ceil(total / pageSize) && +val > 0 && !val.includes('.')) {
        setValue(val);
      } else if (!val) {
        setValue('');
      }
    },
    [setValue, total, pageSize],
  );

  const jump = () => {
    if (value) {
      onTableChange({ pageNo: value });
      setValue('');
      hiddenPopover();
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

export default TableFooter;

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
import { Table as PureTable, Title } from 'app/nusi';
import { map, get } from 'lodash';
import { useUpdate } from 'common';
import { useUserMap } from 'core/stores/userMap';
import { getRender, getTitleRender } from './render-types';
import classnames from 'classnames';
import './table.scss';

const handleState = (_stateObj?: Obj, selectable?: boolean) => {
  const curState: CP_TABLE.IState = {
    ..._stateObj,
    total: _stateObj?.total || 0,
    pageSize: _stateObj?.pageSize || 15,
    pageNo: _stateObj?.pageNo || 1,
  };

  if (selectable && !curState.selectedRowKeys) {
    curState.selectedRowKeys = [];
  }
  return curState;
};

export function Table(props: CP_TABLE.Props) {
  const { state: propsState, customProps, props: configProps, operations, data, execOperation, updateState } = props;
  const list = data?.list || [];
  const {
    visible = true,
    columns = [],
    title,
    pageSizeOptions,
    selectable,
    styleNames = {},
    ...rest
  } = configProps || {};
  const userMap = useUserMap();
  const [state, updater, update] = useUpdate(handleState(propsState, selectable));
  const { total, pageSize, pageNo } = state;

  React.useEffect(() => {
    update(handleState(propsState, selectable));
  }, [propsState, update, selectable]);

  React.useEffect(() => {
    if (customProps?.onStateChange) {
      customProps.onStateChange(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const changePage = (pNo: number, pSize?: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pNo, pageSize: pSize });
  };

  const tableColumns = map([...(columns || [])], (cItem) => ({
    ...cItem,
    ...getTitleRender(cItem),
    render: (val: any, record: Obj) => getRender(val, record, { execOperation, customProps, userMap }),
  })) as any[];

  const isGanttTable = columns.find((item) => item.titleRenderType === 'gantt');

  const pagination = {
    total: total || list.length,
    current: pageNo || 1,
    pageSize: pageSize || 20,
    onChange: (no: number, size?: number) => changePage(no, size),
    ...(pageSizeOptions
      ? {
          showSizeChanger: true,
          pageSizeOptions,
        }
      : {}),
  };

  const extra: Obj = {};
  if (operations?.clickRow) {
    extra.onRow = (record: Obj) => {
      return {
        onClick: () => {
          const curOp = operations.clickRow;
          const clickable = curOp.clickableKeys
            ? (curOp.clickableKeys || []).includes(get(record, rest.rowKey || 'id'))
            : true; // 是否配置了可点击的行
          if (clickable) {
            execOperation(operations.clickRow, record); // 点击行
          }
        },
      };
    };
  }

  if (configProps?.expandedProps) {
    const { rowKey, columns: exColumns } = configProps.expandedProps || {};
    const exTableColumns = map([...(exColumns || [])], (cItem) => ({
      ...cItem,
      ...getTitleRender(cItem),
      render: (val: any, record: CP_TABLE.RowData) => getRender(val, record, { execOperation, customProps, userMap }),
    })) as any[];

    extra.expandedRowRender = (rowData: any) => {
      const { expandedList } = rowData || {};
      return <PureTable columns={exTableColumns} rowKey={rowKey} dataSource={expandedList} pagination={false} />;
    };
  }

  const cls = classnames({
    'dice-cp': true,
    'dice-cp-table': true,
    ...styleNames,
  });

  const onSelectChange = (_selectedRowKeys: string[]) => {
    // updater.selectedRowKeys(_selectedRowKeys);
    updateState({ selectedRowKeys: _selectedRowKeys });
  };

  const rowSelection = selectable
    ? {
        selectedRowKeys: state.selectedRowKeys || [],
        onChange: onSelectChange,
      }
    : undefined;

  return visible ? (
    <>
      {title ? <Title showDivider={false} level={2} title={title} /> : null}
      <PureTable
        className={`${cls} ${isGanttTable ? 'task-gantt-table' : ''}`}
        dataSource={list}
        scroll={{ x: '100%' }}
        {...extra}
        columns={tableColumns}
        pagination={pagination}
        {...rest}
        size="small"
        rowSelection={rowSelection}
      />
    </>
  ) : null;
}

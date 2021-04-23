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
import userMapStore from 'common/stores/user-map';
import { getRender, getTitleRender } from './render-types';
import classnames from 'classnames';
import './table.scss';

const handleState = (_stateObj?: Obj) => {
  return {
    ..._stateObj,
    total: _stateObj?.total || 0,
    pageSize: _stateObj?.pageSize || 15,
    pageNo: _stateObj?.pageNo || 1,
  };
};

export function Table(props: CP_TABLE.Props) {
  const { state: propsState, customProps, props: configProps, operations, data, execOperation } = props;
  const list = data?.list || [];
  const { visible = true, columns = [], title, pageSizeOptions, styleNames = {}, ...rest } = configProps || {};
  const userMap = userMapStore.useStore(s => s);
  const [state, updater, update] = useUpdate(handleState(propsState));
  const { total, pageSize, pageNo } = state;

  React.useEffect(() => {
    update(handleState(propsState));
  }, [propsState, update]);

  React.useEffect(() => {
    if (customProps?.onStateChange) {
      customProps.onStateChange(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const changePage = (pNo: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pNo });
  };

  const changePageSize = (size: number) => {
    operations?.changePageSize && execOperation(operations.changePageSize, { pageNo: 1, pageSize: size });
  };

  const tableColumns = map([...(columns || [])], cItem => ({
    ...cItem,
    ...getTitleRender(cItem),
    render: (val: any, record: Obj) => getRender(val, record, { execOperation, customProps, userMap }),
  })) as any[];

  const isGanttTable = columns.find(item => item.titleRenderType === 'gantt');

  const pagination = {
    total: total || list.length,
    current: pageNo || 1,
    pageSize: pageSize || 20,
    onChange: (no: number) => changePage(no),
    ...(pageSizeOptions ? {
      showSizeChanger: true,
      pageSizeOptions,
      onShowSizeChange: (_no: number, size: number) => {
        changePageSize(size);
      },
    } : {}),
  };

  const extra: Obj = {};
  if (operations?.clickRow) {
    extra.onRow = (record: Obj) => {
      return {
        onClick: () => {
          const curOp = operations.clickRow;
          const clickable = curOp.clickableKeys ? (curOp.clickableKeys || []).includes(get(record, rest.rowKey || 'id')) : true; // 是否配置了可点击的行
          if (clickable) {
            execOperation(operations.clickRow, record); // 点击行
          }
        },
      };
    };
  }

  if (configProps?.expandedProps) {
    const { rowKey, columns: exColumns } = configProps.expandedProps || {};
    const exTableColumns = map([...(exColumns || [])], cItem => ({
      ...cItem,
      ...getTitleRender(cItem),
      render: (val: any, record: CP_TABLE.RowData) => getRender(val, record, { execOperation, customProps, userMap }),
    })) as any[];

    extra.expandedRowRender = (rowData: any) => {
      const { expandedList } = rowData || {};
      return <PureTable tableKey="child-table" columns={exTableColumns} rowKey={rowKey} dataSource={expandedList} pagination={false} />;
    };
  }

  const cls = classnames({
    'dice-cp': true,
    'table': true,
    ...styleNames,
  });

  return visible ? (
    <>
      {title ? <Title showDivider={false} level={2} title={title} /> : null}
      <PureTable
        className={`${cls} ${isGanttTable ? 'task-gantt-table' : ''}`}
        dataSource={list}
        {...extra}
        columns={tableColumns}
        pagination={pagination}
        {...rest}
      />
    </>
  ) : null;
}


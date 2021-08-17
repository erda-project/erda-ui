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
import { Table as PureTable, Title, Menu, Button, Dropdown, Tooltip } from 'core/nusi';
import { map, get, find, sortBy, intersection, has } from 'lodash';
import { useUpdate, Icon as CustomIcon } from 'common';
import { useUserMap } from 'core/stores/userMap';
import { getRender, getTitleRender } from './render-types';
import classnames from 'classnames';
import './table.scss';

interface ISorter {
  order: 'ascend' | 'descend' | undefined;
  field: string;
}

interface ITableAction {
  action: string;
}
const emptyArr = [];
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
  const {
    state: propsState,
    customProps,
    props: configProps,
    operations,
    data,
    execOperation,
    updateState,
    batchOperations,
  } = props;
  const list = data?.list || emptyArr;
  const {
    visible = true,
    columns = [],
    title,
    pageSizeOptions,
    selectable,
    styleNames = {},
    rowKey,
    ...rest
  } = configProps || {};
  const userMap = useUserMap();
  const [state, updater, update] = useUpdate(handleState(propsState, selectable));
  const { total, pageSize, pageNo } = state;

  React.useEffect(() => {
    update((prev) => {
      return {
        ...prev,
        ...handleState(propsState, selectable),
      };
    });
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

  const onChange = (_pg: Obj, _filter: Obj, _sorter: ISorter, _extra: ITableAction) => {
    if (_extra?.action === 'sort' && operations?.changeSort) {
      const sorterData = _sorter?.order ? { field: _sorter?.field, order: _sorter?.order } : undefined;
      execOperation(operations.changeSort, { sorterData });
    }
  };

  const chosenItems = React.useMemo(() => {
    return state.selectedRowKeys?.map((sItem) => {
      const curItem = find(list, { [rowKey]: sItem });
      return curItem;
    });
  }, [state.selectedRowKeys, list, rowKey]);

  const rowSelection = selectable
    ? {
        selectedRowKeys: state.selectedRowKeys || [],
        onChange: onSelectChange,
      }
    : undefined;

  return visible ? (
    <div className="relative" style={{ paddingBottom: configProps.pagination === false ? 64 : 'unset' }}>
      {title ? <Title showDivider={false} level={2} title={title} /> : null}
      <PureTable
        className={`${cls} ${isGanttTable ? 'task-gantt-table' : ''}`}
        dataSource={list}
        scroll={{ x: '100%' }}
        rowKey={rowKey}
        {...extra}
        columns={tableColumns}
        pagination={pagination}
        {...rest}
        size="small"
        rowSelection={rowSelection}
        onChange={onChange}
      />
      {batchOperations ? (
        <div className="absolute" style={{ bottom: 16 }}>
          <BatchOperation
            operations={batchOperations}
            selectedRowKeys={state.selectedRowKeys}
            chosenItems={chosenItems}
            execOperation={execOperation}
          />
        </div>
      ) : null}
    </div>
  ) : null;
}

interface IBatchProps {
  operations?: Obj<CP_COMMON.Operation>;
  chosenItems?: Array<Obj | undefined>;
  execOperation: Function;
  selectedRowKeys?: string[];
}

const BatchOperation = (props: IBatchProps) => {
  const { operations, chosenItems, execOperation, selectedRowKeys } = props;

  const optMenus = React.useMemo(() => {
    const fullMenus = sortBy(map(operations), 'showIndex');
    const chosenOpts = intersection(...map(chosenItems, 'batchOptions'));
    return fullMenus.map((mItem) => {
      const disabledProps = selectedRowKeys?.length
        ? {
            disabled: has(mItem, 'disabled') ? mItem.disabeld : !chosenOpts.includes(mItem.key),
            disabledTip: '已选项中存在不符合操作条件的项',
          }
        : { disabled: true, disabledTip: '未选中任何项' };
      const reMenu = {
        ...mItem,
        ...disabledProps,
      };
      return reMenu;
    });
  }, [chosenItems, operations, selectedRowKeys]);

  const dropdownMenu = (
    <Menu
      onClick={(e: any) => {
        e.domEvent.stopPropagation();
        const curOp = find(optMenus, { key: e.key });
        !curOp?.disabled && execOperation(curOp, { selectedRowKeys });
      }}
    >
      {map(optMenus, (mItem) => {
        return (
          <Menu.Item key={mItem.key} disabled={mItem.disabled}>
            <Tooltip placement="right" title={mItem.disabled ? mItem.disabledTip : ''}>
              <div className="flex items-center">{mItem.text}</div>
            </Tooltip>
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <div className="flex items-center">
      <span className="mr-2">{`已选择 ${selectedRowKeys?.length || 0} 项`}</span>
      <Dropdown overlay={dropdownMenu}>
        <Button>
          {'批量操作'}
          <CustomIcon type={'di'} className="ml-1" />
        </Button>
      </Dropdown>
    </div>
  );
};

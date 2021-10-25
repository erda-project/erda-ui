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
import { Table as PureTable, Menu, Button, Dropdown, Checkbox } from 'antd';
import { map, get, find, intersection, has, difference, compact } from 'lodash';
import { Icon as CustomIcon, Title } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useUserMap } from 'core/stores/userMap';
import { OperationAction } from 'app/config-page/utils';
import { getRender, getTitleRender } from './render-types';
import { DownOne as IconDownOne } from '@icon-park/react';
import i18n from 'i18n';
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
  const { state: propsState, customProps, props: configProps, operations, data, execOperation, updateState } = props;
  const list = data?.list || emptyArr;
  const {
    visible = true,
    columns = [],
    title,
    pageSizeOptions,
    selectable,
    styleNames = {},
    rowKey,
    batchOperations,
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

  const changePage = operations?.changePageNo
    ? (pNo: number, pSize?: number) => {
        execOperation(operations.changePageNo, { pageNo: pNo, pageSize: pSize });
      }
    : undefined;

  const tableColumns = map([...(columns || [])], (cItem) => ({
    ...cItem,
    ...getTitleRender(cItem),
    render: (val: any, record: Obj) => getRender(val, record, { execOperation, customProps, userMap }),
  })) as any[];

  const isGanttTable = columns.find((item) => item.titleRenderType === 'gantt');

  let pagination = changePage
    ? {
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
      }
    : undefined;

  if (!pagination && pageSizeOptions) {
    pagination = {
      showSizeChanger: true,
      pageSizeOptions,
    };
  }

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
    <div
      className="relative"
      style={{ paddingBottom: configProps?.pagination === false && batchOperations ? 64 : 'unset' }}
    >
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
            rowKey={rowKey}
            dataSource={list}
            operations={operations}
            batchOperations={batchOperations}
            selectedRowKeys={state.selectedRowKeys}
            chosenItems={chosenItems}
            execOperation={execOperation}
            onSelectChange={onSelectChange}
          />
        </div>
      ) : null}
    </div>
  ) : null;
}

interface IBatchProps {
  rowKey: string;
  dataSource: Obj[];
  onSelectChange: (keys: string[]) => void;
  batchOperations: string[];
  operations?: Obj<CP_COMMON.Operation>;
  chosenItems?: Array<Obj | undefined>;
  execOperation: Function;
  selectedRowKeys?: string[];
}

const BatchOperation = (props: IBatchProps) => {
  const {
    rowKey,
    dataSource,
    onSelectChange,
    operations,
    chosenItems,
    execOperation,
    selectedRowKeys = emptyArr,
    batchOperations,
  } = props;

  const [{ checkAll, indeterminate }, updater, update] = useUpdate({
    checkAll: false,
    indeterminate: false,
  });

  React.useEffect(() => {
    const allKeys = map(dataSource, rowKey);
    const curChosenKeys = intersection(allKeys, selectedRowKeys);
    update({
      checkAll: !!(curChosenKeys.length && curChosenKeys.length === allKeys.length),
      indeterminate: !!(curChosenKeys.length && curChosenKeys.length < allKeys.length),
    });
  }, [update, dataSource, rowKey, selectedRowKeys]);

  const optMenus = React.useMemo(() => {
    const fullMenus = batchOperations.map((btItem) => find(operations, (opItem) => opItem.key === btItem));
    const chosenOpts = intersection(...map(chosenItems, 'batchOperations'));
    return fullMenus.map((mItem) => {
      const disabledProps = selectedRowKeys?.length
        ? {
            disabled: has(mItem, 'disabled') ? mItem.disabeld : !chosenOpts.includes(mItem.key),
            disabledTip: i18n.t('exist item which not match operation'),
          }
        : { disabled: true, disabledTip: i18n.t('no items selected') };
      const reMenu = {
        ...mItem,
        ...disabledProps,
      };
      return reMenu;
    });
  }, [batchOperations, chosenItems, operations, selectedRowKeys]);

  const dropdownMenu = (
    <Menu>
      {map(optMenus, (mItem) => {
        return (
          <Menu.Item key={mItem.key} disabled={mItem.disabled}>
            <OperationAction
              operation={mItem}
              onClick={() => execOperation(mItem, { selectedRowKeys })}
              tipProps={{ placement: 'right' }}
            >
              <div>{mItem.text}</div>
            </OperationAction>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const onCheckAllChange = () => {
    const allKeys = map(dataSource, rowKey);
    if (checkAll) {
      onSelectChange(difference(selectedRowKeys, allKeys));
    } else {
      onSelectChange(compact(selectedRowKeys.concat(allKeys)));
    }
  };

  return (
    <div className="flex items-center">
      <Checkbox className="mx-2" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
      <span className="mr-2">{`${i18n.t('selected {xx}', {
        xx: `${selectedRowKeys?.length || 0}${i18n.t('common:items')}`,
      })}`}</span>
      <Dropdown overlay={dropdownMenu} zIndex={1000}>
        <Button>
          {i18n.t('batch operate')}
          <IconDownOne theme="filled" className="ml-1" />
        </Button>
      </Dropdown>
    </div>
  );
};

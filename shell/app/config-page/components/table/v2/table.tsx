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
import { Button, Checkbox, Dropdown, Menu } from 'antd';
import PureTable from 'common/components/table';
import { TablePaginationConfig } from 'common/components/table/interface';
import { compact, difference, has, intersection, isNil, map } from 'lodash';
import { ErdaIcon, Title } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useUpdateEffect } from 'react-use';
import { execMultipleOperation, filterClickOperations, OperationAction } from 'app/config-page/utils';
import i18n from 'i18n';
import { convertTableData } from './utils';

interface ISorter {
  order: 'ascend' | 'descend' | undefined;
  field: string;
}

interface ITableAction {
  action: string;
}

const Table = (props: CP_TABLE2.Props) => {
  const { state: propsState, customOp, props: pProps, operations, data, execOperation, updateState, slot } = props;

  const { changePage: changePageOp, changeSort, batchRowsHandle } = operations || {};
  const { title } = data || {};
  const curTitle = title || pProps?.title;
  const selectable = !!batchRowsHandle;
  const { dataSource, columns, rowKey, rowSelection, pageNo, pageSize, total, pageSizeOptions } = convertTableData(
    data,
    !!batchRowsHandle,
    pProps,
  );

  const [state, updater, update] = useUpdate({
    ...propsState,
    selectedRowKeys: selectable ? rowSelection?.selectedRowKeys : [],
  });

  useUpdateEffect(() => {
    update((prev) => {
      return {
        ...prev,
        ...propsState,
      };
    });
  }, [propsState]);

  useUpdateEffect(() => {
    if (customOp?.onStateChange) {
      customOp.onStateChange(state);
    }
  }, [state]);

  const changePage = changePageOp
    ? (pNo: number, pSize?: number) => {
        execOperation({ key: 'changePage', ...changePageOp, clientData: { pageNo: pNo, pageSize: pSize } });
      }
    : undefined;

  const pagination =
    pProps?.pagination ??
    (changePage
      ? {
          total: total || dataSource?.length,
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
      : undefined);

  const extra: Obj = {};
  if (dataSource.find((item) => Object.keys(filterClickOperations(item.operations)).length) || customOp?.clickRow) {
    extra.onRow = (record: Obj) => {
      return {
        onClick: () => {
          execMultipleOperation(filterClickOperations(record.operations), (op) =>
            execOperation({ ...op, clientData: { dataRef: record } }),
          );
          customOp?.clickRow?.(record);
        },
      };
    };
  }

  const onSelectChange = (_selectedRowKeys: Array<string | number>) => {
    updater.selectedRowKeys(_selectedRowKeys);
    updateState({ selectedRowKeys: _selectedRowKeys });
  };

  const onChange = (_pg: TablePaginationConfig, _filter: Obj, _sorter: ISorter, _extra: ITableAction) => {
    if (_extra?.action === 'sort' && changeSort) {
      execOperation({
        key: 'changeSort',
        ...changeSort,
        clientData: {
          dataRef: {
            fieldBindToOrder: _sorter.field,
            ascOrder: isNil(_sorter?.order) ? null : _sorter?.order === 'ascend',
          },
        },
      });
    }
  };

  const curRowSelection = selectable
    ? {
        ...rowSelection,
        selectedRowKeys: state.selectedRowKeys || [],
        onChange: onSelectChange,
      }
    : undefined;
  return (
    <div className="relative" style={{ paddingBottom: pagination === false && batchRowsHandle ? 64 : 'unset' }}>
      {curTitle ? <Title showDivider={false} level={2} title={curTitle} /> : null}
      <PureTable
        {...extra}
        dataSource={dataSource}
        slot={slot}
        scroll={{ x: '100%' }}
        rowKey={rowKey}
        columns={columns}
        pagination={pagination}
        size="small"
        rowSelection={curRowSelection}
        onChange={onChange}
      />
      {batchRowsHandle ? (
        <div className="absolute" style={{ bottom: 10, left: 24 }}>
          <BatchOperation
            rowKey={rowKey}
            dataSource={dataSource}
            batchRowsHandle={batchRowsHandle}
            selectedRowKeys={state.selectedRowKeys}
            execOperation={execOperation}
            onSelectChange={onSelectChange}
          />
        </div>
      ) : null}
    </div>
  );
};

interface IBatchProps<T> {
  rowKey: string;
  dataSource: T[];
  onSelectChange: (keys: string[]) => void;
  batchRowsHandle: CP_TABLE2.IBatchOperation;
  execOperation: Function;
  selectedRowKeys?: string[];
}

const emptyArr: string[] = [];
const BatchOperation = <T extends unknown>(props: IBatchProps<T>) => {
  const { rowKey, dataSource, onSelectChange, execOperation, selectedRowKeys = emptyArr, batchRowsHandle } = props;

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
    const { options } = batchRowsHandle?.serverData;
    return options.map((mItem) => {
      const { allowedRowIDs, forbiddenRowIDs } = mItem;
      const validChosenOpt =
        intersection(selectedRowKeys, allowedRowIDs || selectedRowKeys).length === selectedRowKeys.length &&
        intersection(selectedRowKeys, forbiddenRowIDs).length === 0;

      const disabledProps = selectedRowKeys?.length
        ? {
            disabled: has(mItem, 'disabled') ? mItem.disabled : !validChosenOpt,
            disabledTip: i18n.t('exist item which not match operation'),
          }
        : { disabled: true, disabledTip: i18n.t('no items selected') };
      const reMenu = {
        ...mItem,
        ...disabledProps,
      };
      return reMenu;
    });
  }, [batchRowsHandle, selectedRowKeys]);

  const dropdownMenu = (
    <Menu>
      {map(optMenus, (mItem) => {
        return (
          <Menu.Item key={mItem.id} disabled={!!mItem.disabled}>
            <OperationAction
              operation={{ ...mItem, ...batchRowsHandle }}
              onClick={() =>
                execOperation({
                  key: 'batchRowsHandle',
                  ...batchRowsHandle,
                  clientData: { dataRef: mItem, selectedOptionsID: mItem.id, selectedRowIDs: selectedRowKeys },
                })
              }
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
        xx: `${selectedRowKeys?.length || 0} ${i18n.t('common:items')}`,
      })}`}</span>
      <Dropdown overlay={dropdownMenu} zIndex={1000}>
        <Button className="flex items-center">
          {i18n.t('batch operate')}
          <ErdaIcon size="18" type="caret-down" className="ml-1 text-black-200" />
        </Button>
      </Dropdown>
    </div>
  );
};

export default Table;

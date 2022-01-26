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
import { map, isBoolean, difference, intersection, has, compact } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { useUpdateEffect } from 'react-use';
import { HeadOperationBar, ErdaIcon } from 'common';
import { Checkbox, Menu, Dropdown, Button } from 'antd';
import { OperationAction, execMultipleOperation } from 'config-page/utils';
import { PAGINATION } from 'app/constants';
import i18n from 'i18n';
import ErdaList from 'app/common/components/base-list';

const emptyArr = [] as CP_BASE_LIST.ListItem[];
const List = (props: CP_BASE_LIST.Props) => {
  const { customOp, operations, execOperation, props: configProps, data, filter } = props;
  const { list = emptyArr, total, pageNo, pageSize } = data || {};
  const [state, updater, update] = useUpdate({
    total: total || 0,
    pageNo: pageNo || 1,
    pageSize: pageSize || PAGINATION.pageSize,
    selectedRowKeys: [],
    combineList: list,
  });

  const {
    whiteHead,
    isLoadMore = false,
    hideHead,
    className = '',
    wrapperClassName = '',
    ...restProps
  } = configProps || {};

  const currentList = React.useMemo(
    () =>
      (isLoadMore ? state.combineList : list).map((item: CP_BASE_LIST.ListItem) => {
        const extra: any = [];
        const kvInfos = item.kvInfos?.map((infoItem, idx) => {
          return {
            ...infoItem,
            compWapper: (children: React.ReactElement) => (
              <OperationAction
                key={idx}
                tip={infoItem.tip}
                operations={infoItem.operations}
                onClick={(e) => {
                  e.stopPropagation();
                  execMultipleOperation(infoItem.operations, (op) =>
                    execOperation({ ...op, clientData: { dataRef: item, operationRef: infoItem } }),
                  );
                }}
              >
                {children}
              </OperationAction>
            ),
          };
        });

        const titleState = item.titleState?.map((stateItem, idx) => {
          return {
            ...stateItem,
            ...(stateItem.operations
              ? {
                  onClick: (e) => {
                    if (stateItem.operations) {
                      stateItem.operations?.click &&
                        customOp?.clickItem?.(stateItem.operations?.click, { record: item, action: 'clickTitleState' });
                      e.stopPropagation();
                      execMultipleOperation(stateItem.operations, (op) =>
                        execOperation({ ...op, clientData: { dataRef: item, operationRef: stateItem } }),
                      );
                    }
                  },
                }
              : {}),
          };
        });

        const hoverIcons = item.columnsInfo?.hoverIcons?.map((iconItem, idx) => {
          return {
            ...iconItem,
            compWapper: (children: React.ReactElement) => (
              <OperationAction
                key={idx}
                tip={iconItem.tip}
                operations={iconItem.operations}
                onClick={(e) => {
                  e.stopPropagation();
                  execMultipleOperation(iconItem.operations, (op) =>
                    execOperation({ ...op, clientData: { dataRef: item, operationRef: iconItem } }),
                  );
                }}
              >
                {children}
              </OperationAction>
            ),
          };
        });

        const { star, ...restOp } = item.operations || {};

        const moreOperations = map(item.moreOperations, (opItem, idx) => {
          const clickFn = () => {
            execMultipleOperation(opItem.operations, (op) =>
              execOperation({ ...op, clientData: { dataRef: item, operationRef: opItem } }),
            );
          };
          return {
            key: opItem.key || idx,
            icon: opItem.icon,
            onClick: clickFn,
            text: (
              <OperationAction
                tip={opItem.tip}
                tipProps={{ placement: 'left' }}
                operations={opItem.operations}
                onClick={clickFn}
              >
                <div className="flex-h-center">
                  {opItem.icon ? <ErdaIcon type={opItem.icon} className="mr-1" /> : null}
                  <span>{opItem.text}</span>
                </div>
              </OperationAction>
            ),
          };
        });
        const { icon, ...restItem } = item;
        const { type, url } = icon || {};
        return {
          ...(type ? { icon: type } : url ? { logoURL: url } : {}),
          ...restItem,
          selected: state.selectedRowKeys.includes(item.id),
          kvInfos,
          titleState,
          extra,
          ...(hoverIcons ? { columnsInfo: { ...item.columnsInfo, hoverIcons } } : {}),
          operations:
            star && isBoolean(item.star)
              ? [
                  {
                    tip: star.tip,
                    key: 'star',
                    compWapper: (children: React.ReactElement) => (
                      <OperationAction
                        key={'star'}
                        operation={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          execOperation({ key: 'star', ...star, clientData: { dataRef: item } }, item);
                        }}
                      >
                        {children}
                      </OperationAction>
                    ),
                    fill: item.star ? 'yellow' : undefined,
                    icon: item.star ? 'unstar' : 'star',
                  },
                ]
              : [],
          moreOperations,
          itemProps: {
            onClick: () => {
              if (restOp) {
                Object.keys(restOp || {}).forEach((opKey) => {
                  execOperation({ key: opKey, ...restOp[opKey], clientData: { dataRef: { ...item } } }, item);
                });
              }
              customOp?.clickItem?.(restOp, { record: item, action: 'clickLine' });
            },
          },
        };
      }),
    [customOp, execOperation, isLoadMore, list, state.combineList, state.selectedRowKeys],
  );

  useUpdateEffect(() => {
    customOp?.onStateChange?.(state);
  }, [state]);

  // 将接口返回的list和之前的list进行拼接
  React.useEffect(() => {
    // if isLoadMore is true, the data will be set undefined, combineList don't need to do anything
    if (data === undefined) {
      return;
    }
    update((pre) => {
      const newState = {
        ...pre,
        total,
        pageNo,
        pageSize,
      };
      return {
        ...newState,
        combineList: newState.pageNo === 1 ? list : (newState.combineList || []).concat(list),
      };
    });
  }, [list, update, data, total, pageNo, pageSize]);

  const changePage = (pNo: number, pSize: number) => {
    operations?.changePage &&
      execOperation(
        {
          key: 'changePage',
          ...operations.changePage,
          clientData: {
            pageNo: pNo,
            pageSize: pSize,
          },
        },
        { pageNo: pNo, pageSize: pSize },
      );
  };

  const loadMore = (curPageNo: number) => {
    operations?.changePage &&
      execOperation(
        {
          key: 'changePage',
          ...operations.changePage,
          clientData: {
            pageNo: curPageNo + 1,
            pageSize: state.pageSize,
          },
        },
        { pageNo: curPageNo + 1, pageSize: state.pageSize },
      );
  };

  const onSelectChange = (_selectedRowKeys: Array<string | number>) => {
    updater.selectedRowKeys(_selectedRowKeys);
  };

  const [batchOperation, onSelectItemChange] = operations?.batchRowsHandle
    ? [
        <BatchOperation
          rowKey={'id'}
          dataSource={currentList}
          batchRowsHandle={operations.batchRowsHandle}
          selectedRowKeys={state.selectedRowKeys}
          execOperation={execOperation}
          onSelectChange={onSelectChange}
        />,
        (rowId: string) => {
          onSelectChange(
            state.selectedRowKeys.includes(rowId)
              ? state.selectedRowKeys.filter((item) => item !== rowId)
              : [...state.selectedRowKeys, rowId],
          );
        },
      ]
    : [];

  const HeadTitle = data.title ? (
    <span className="font-medium text-default-8 h-[48px] flex-h-center">
      {data.title}
      {data.titleSummary !== undefined ? (
        <span className="inline-block ml-1 bg-default-1 px-1.5 rounded-lg text-default-8 text-xs leading-5">
          {data.titleSummary}
        </span>
      ) : null}
    </span>
  ) : null;
  const onReload = () => {
    changePage(pageNo, pageSize);
  };
  const Head = !hideHead ? (
    <div>
      <div className="px-4">{HeadTitle}</div>
      <HeadOperationBar className={`${whiteHead ? 'bg-white' : ''}`} leftSolt={filter} onReload={onReload} />
    </div>
  ) : HeadTitle || filter ? (
    <div className="flex justify-between items-center mb-2 min-h-[48px] px-4">
      {HeadTitle}
      <div>{filter}</div>
    </div>
  ) : null;
  return (
    <div className={`rounded-sm flex h-full flex-col ${wrapperClassName}`}>
      {Head}
      <ErdaList
        {...restProps}
        className={`${className} flex-1 overflow-hidden`}
        dataSource={currentList}
        onSelectChange={onSelectItemChange}
        batchOperation={batchOperation}
        pagination={{
          pageNo: state.pageNo || 1,
          pageSize: state.pageSize,
          total: state.total || 0,
          onChange: (pNo: number, pSize: number) => changePage(pNo, pSize),
        }}
        isLoadMore={isLoadMore}
        onLoadMore={loadMore}
        getKey={(item) => item.id}
      />
    </div>
  );
};

interface IBatchProps<T> {
  rowKey: string;
  dataSource: T[];
  onSelectChange: (keys: string[]) => void;
  batchRowsHandle: CP_COMMON.IBatchOperation;
  execOperation: Function;
  selectedRowKeys?: string[];
}

const emptyKeys: string[] = [];
const BatchOperation = <T extends unknown>(props: IBatchProps<T>) => {
  const { rowKey, dataSource, onSelectChange, execOperation, selectedRowKeys = emptyKeys, batchRowsHandle } = props;

  const selectableData = React.useMemo(() => dataSource.filter((item) => item.selectable !== false), [dataSource]);

  const [{ checkAll, indeterminate }, updater, update] = useUpdate({
    checkAll: false,
    indeterminate: false,
  });

  React.useEffect(() => {
    const allKeys = map(selectableData, rowKey);
    const curChosenKeys = intersection(allKeys, selectedRowKeys);
    update({
      checkAll: !!(curChosenKeys.length && curChosenKeys.length === allKeys.length),
      indeterminate: !!(curChosenKeys.length && curChosenKeys.length < allKeys.length),
    });
  }, [update, selectableData, rowKey, selectedRowKeys]);

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
    <Menu theme="dark">
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
              <div className="flex-h-center">
                {mItem.icon ? <ErdaIcon type={mItem.icon} className="mr-1" /> : null}
                <span>{mItem.text}</span>
              </div>
            </OperationAction>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const onCheckAllChange = () => {
    const allKeys = map(selectableData, rowKey);
    if (checkAll) {
      onSelectChange(difference(selectedRowKeys, allKeys));
    } else {
      onSelectChange(compact(selectedRowKeys.concat(allKeys)));
    }
  };

  return (
    <div className="flex items-center">
      <Checkbox className="mr-2" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
      <span className="mr-2">{`${i18n.t('selected {name}', {
        name: `${selectedRowKeys?.length || 0} ${i18n.t('common:items')}`,
      })}`}</span>
      <Dropdown overlay={dropdownMenu} zIndex={1000}>
        <Button className="flex items-center">
          {i18n.t('batch operate')}
          <ErdaIcon size="18" type="caret-down" className="ml-1 text-default-4" />
        </Button>
      </Dropdown>
    </div>
  );
};

export default List;

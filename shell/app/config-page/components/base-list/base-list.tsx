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
import { map, isBoolean } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { OperationAction, execMultipleOperation } from 'config-page/utils';
import { PAGINATION } from 'app/constants';
import ErdaList from 'app/common/components/base-list';

const emptyArr = [] as CP_BASE_LIST.ListItem[];
const List = (props: CP_BASE_LIST.Props) => {
  const { customOp, operations, execOperation, props: configProps, data, filter } = props;
  const { list = emptyArr, total, pageNo, pageSize } = data || {};
  const [state, updater, update] = useUpdate({
    total: total || 0,
    pageNo: pageNo || 1,
    pageSize: pageSize || PAGINATION.pageSize,
    combineList: list,
  });

  const { isLoadMore = false, ...restProps } = configProps || {};

  const currentList = React.useMemo(
    () =>
      (isLoadMore ? state.combineList : list).map((item: CP_BASE_LIST.ListItem) => {
        const extra: any = [];
        const kvInfos = item.kvInfos?.map((infoItem) => {
          return {
            ...infoItem,
            compWapper: (children: React.ReactElement) => (
              <OperationAction
                operations={infoItem.operations}
                onClick={(e) => {
                  e.stopPropagation();
                  execMultipleOperation(infoItem.operations, (op) =>
                    execOperation({ ...op, clientData: { dataRef: item } }),
                  );
                }}
              >
                {children}
              </OperationAction>
            ),
          };
        });

        const hoverIcons = item.columnsInfo?.hoverIcons?.map((iconItem) => {
          return {
            ...iconItem,
            compWapper: (children: React.ReactElement) => (
              <OperationAction
                operations={iconItem.operations}
                onClick={(e) => {
                  e.stopPropagation();
                  execMultipleOperation(iconItem.operations, (op) =>
                    execOperation({ ...op, clientData: { dataRef: item } }),
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
              execOperation({ ...op, clientData: { dataRef: { ...opItem } } }),
            );
          };
          return {
            key: opItem.key || idx,
            icon: opItem.icon,
            onClick: clickFn,
            text: (
              <OperationAction tipProps={{ placement: 'left' }} operations={opItem.operations} onClick={clickFn}>
                <div>{opItem.text}</div>
              </OperationAction>
            ),
          };
        });

        return {
          ...item,
          kvInfos,
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
              customOp?.clickItem?.(restOp, item);
            },
          },
        };
      }),
    [customOp, execOperation, isLoadMore, list, state.combineList],
  );

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

  return (
    <div>
      {data.title || filter ? (
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-default-8">
            {data.title}
            {data.titleSummary !== undefined ? (
              <span className="inline-block ml-1 bg-default-1 px-1.5 rounded-lg text-default-8 text-xs leading-5">
                {data.titleSummary}
              </span>
            ) : null}
          </span>
          <div>{filter}</div>
        </div>
      ) : null}
      <ErdaList
        {...restProps}
        dataSource={currentList}
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

export default List;

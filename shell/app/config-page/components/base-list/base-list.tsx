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
import { map } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { OperationAction } from 'config-page/utils';
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

  const { isLoadMore = false } = configProps || {};
  const currentList = React.useMemo(
    () =>
      (isLoadMore ? state.combineList : list).map((item: CP_BASE_LIST.ListItem) => {
        const extra: any = [];
        const metaInfos = item.metaInfos?.map((infoItem) => {
          return {
            ...infoItem,
            extraProps: {
              onClick: (e) => {
                e.stopPropagation();
                if (infoItem.operations?.click) {
                  execOperation(infoItem.operations.click, infoItem);
                }
              },
            },
          };
        });

        const { click, star } = item.operations || {};

        const { operationsOrder } = item.moreOperations || {};
        const moreOperations = map(item.moreOperations?.operations, (action, key) => {
          const clickFn = () => {
            execOperation(action, item);
          };
          return {
            key,
            index: operationsOrder ? operationsOrder.findIndex((actionKey) => actionKey === key) : 1,
            icon: action.icon,
            onClick: clickFn,
            text: (
              <OperationAction tipProps={{ placement: 'left' }} operation={action} onClick={clickFn}>
                <div>{action.text}</div>
              </OperationAction>
            ),
          };
        }).sort((a, b) => a.index - b.index);

        return {
          ...item,
          metaInfos,
          extra,
          operations: star
            ? [
                {
                  key: 'star',
                  icon: 'star',
                  onClick: () => {
                    execOperation(star, item);
                  },
                },
              ]
            : [],
          moreOperations,
          itemProps: {
            onClick: () => {
              if (click) {
                execOperation(click, item);
              }
              if (customOp?.clickItem) {
                customOp.clickItem(click, item);
              }
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
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pNo, pageSize: pSize });
  };

  const loadMore = (curPageNo: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: curPageNo + 1 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">
          {data.title}
          {data.summary !== undefined ? (
            <span className="ml-1 bg-default-04 px-1 rounded-lg">{data.summary}</span>
          ) : null}
        </span>
        <div>{filter}</div>
      </div>
      <ErdaList
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

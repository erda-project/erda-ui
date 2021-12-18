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
import { filter, map, sortBy } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { OperationAction } from 'config-page/utils';
import { containerMap } from '../../components';
import { PAGINATION } from 'app/constants';
import ErdaList from 'app/common/components/base-list';

const emptyArr = [] as CP_BASE_LIST.ListItem[];
const List = (props: CP_BASE_LIST.Props) => {
  const { customOp, operations, execOperation, props: configProps, data, state: propsState } = props;
  const { list = emptyArr } = data || {};
  const [state, updater, update] = useUpdate({
    ...propsState,
    total: propsState?.total || 0,
    pageNo: propsState?.pageNo || 1,
    pageSize: propsState?.pageSize || PAGINATION.pageSize,
    combineList: list,
  });

  const { isLoadMore = false } = configProps || {};
  const currentList = React.useMemo(
    () =>
      (isLoadMore ? state.combineList : list).map((item: CP_BASE_LIST.ListItem) => {
        const extra: any = [];
        const metaInfos = [] as ERDA_LIST.MetaInfo[];
        if (item.extra) {
          Object.values(item.extra).forEach((CompConfig) => {
            const Comp = containerMap[CompConfig.type];
            if (CompConfig.type === 'kvList') {
              // TODO: add kvList component,and  remove this special logic
              map(CompConfig.data, (infoItem) => {
                metaInfos.push({
                  ...infoItem,
                  extraProps: {
                    onClick: (e) => {
                      e.stopPropagation();
                      execOperation(infoItem.operations?.click, infoItem);
                    },
                  },
                });
              });
              return;
            }
            if (Comp) {
              extra.push(
                <div className="mx-2 flex-1">
                  <Comp {...CompConfig} />
                </div>,
              );
            }
          });
        }

        const { click, ...restOp } = item.operations || {};

        const actions = sortBy(
          filter(map(restOp) || [], (actionItem) => actionItem.show !== false),
          'showIndex',
        );

        const itemOperations = actions.map((action) => {
          const clickFn = () => {
            execOperation(action, item);
            if (customOp && customOp[action.key]) {
              customOp[action.key](action, data);
            }
          };
          return {
            text: (
              <OperationAction tipProps={{ placement: 'left' }} operation={action} onClick={clickFn}>
                <div>{action.text}</div>
              </OperationAction>
            ),
            key: action.key,
            icon: action.icon,
            onClick: clickFn,
          };
        });

        return {
          ...item,
          metaInfos,
          extra,
          operations: itemOperations,
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
    [customOp, data, execOperation, isLoadMore, list, state.combineList],
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
        ...propsState,
      };
      return {
        ...newState,
        combineList: newState.pageNo === 1 ? list : (newState.combineList || []).concat(list),
      };
    });
  }, [propsState, list, update, data]);

  const changePage = (pNo: number, pSize: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pNo, pageSize: pSize });
  };

  const loadMore = (curPageNo: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: curPageNo + 1 });
  };

  return (
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
  );
};

export default List;

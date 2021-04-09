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
import { SortDragGroupList as PureSortDragGroupList } from 'common';
import { map } from 'lodash';

const empty = [] as any[];
export const SortDragGroupList = (props: CP_SORT_GROUP.Props) => {
  const { state, execOperation, operations, data, props: configProps } = props;
  const { delay, ...rest } = configProps || {};
  const _list = data.value || empty;

  const dealData = (list:any[], type: string) => {
    return list.map(_data => {
      const _operations = map(_data.operations || [], op => {
        return {
          ...op,
          onClick: (obj: any) => {
            execOperation(op, obj.data);
          },
        };
      });
      return {
        type,
        data: { ..._data, operations: _operations },
      };
    });
  };

  const onClickItem = (item: Obj) => {
    execOperation(operations?.clickItem, item.data);
  };

  const onMoveItem = (_data: any) => {
    execOperation(operations?.moveItem, { dragParams: _data });
  };

  const onMoveGroup = (_data: any) => {
    execOperation(operations?.moveGroup, { dragParams: _data });
  };

  const val = React.useMemo(() => {
    return dealData(_list, data.type);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_list, data.type]);

  return (
    <>
      <PureSortDragGroupList {...rest} value={val} disableDropInItem disableDropInGroup={false} onMoveItem={onMoveItem} onMoveGroup={onMoveGroup} onClickItem={onClickItem} />
    </>
  );
};

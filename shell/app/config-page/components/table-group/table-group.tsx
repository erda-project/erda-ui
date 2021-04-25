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
import { map } from 'lodash';
import { useUpdate } from 'common';
import Title from '../title/title';
import Text from '../text/text';
import { Table } from '../table/table'
import './table-group.scss'

const noop = () => { };
const TableBoard = (props: CP_TABLE_GROUP.ITableBoardProps) => {
  const { props: configProps, execOperation = noop, updateState = noop } = props
  const { title, subtitle, description, table, extraInfo } = configProps;
  const extraProps = { execOperation, updateState };

  return (
    <div className='table-board'>
      <Title props={title} type="Title" {...extraProps} />
      <div className='table-board-card'>
        <Title props={subtitle} type="Title" {...extraProps} />
        <div className="mt12 ml32">
          <div className='mb12 ml8'>
            <Text props={description} type="Text" {...extraProps} />
          </div>
          <Table
            props={table.props}
            data={table.data}
            operations={table.operations}
            {...extraProps}
            type="Table"
          />
          <div className='mt12 ml8'>
            <Text
              props={extraInfo.props}
              operations={extraInfo.operations}
              type="Text"
              {...extraProps}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TableGroup = (props: CP_TABLE_GROUP.Props) => {
  const { props: configProps, state: propsState, data = {} as CP_TABLE_GROUP.IData, operations, execOperation = noop, updateState = noop } = props;
  const [{ pageNo, list: combineList = [], total, pageSize }, updater, update] = useUpdate({
    pageNo: propsState?.pageNo || 1,
    total: propsState?.total || 0,
    pageSize: propsState?.pageSize || 3,
    list: [],
  } || {}) as any;
  const { visible } = configProps;
  const showLoadMore = total > Math.max(combineList.length, 0)

  // 将接口返回的list和之前的list进行拼接
  React.useEffect(() => {
    if (pageNo !== 1) {
      updater.list([...combineList, ...(data.list || [])])
    } else {
      updater.list(data.list);
    }
  }, [updater, data.list])

  // 当propsState改变时去更新state
  React.useEffect(() => {
    update(propsState || {});
  }, [propsState, update]);

  // 加载更多
  const loadMore = () => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pageNo + 1 })
  }

  if (!visible) {
    return null;
  }
  return (
    <div className="cp-dice-table-group">
      {
        map(combineList, item => {
          return (
            <TableBoard type="TableBoard" props={item} execOperation={execOperation} updateState={updateState} operations={operations} />
          )
        })
      }
      {showLoadMore && <div className='load-more hover-active' onClick={loadMore}>加载更多...</div>}
    </div>
  )
}

export default TableGroup;

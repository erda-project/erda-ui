import * as React from 'react';
import { map, get } from 'lodash';
import { Icon as CustomIcon, useUpdate, EmptyHolder } from 'common';
import Title from './title/title';
import Text from './text/text';
import { Table } from './table/table'
import './table-group.scss'

interface ITableBoardProps extends CONFIG_PAGE.ICommonProps {
  props: IData;
}

interface IData {
  title: CP_TITLE.IProps;
  subtitle: CP_TITLE.IProps;
  description: CP_TEXT.IProps;
  table: CP_TABLE.Props;
  extraInfo: CP_TEXT.Props;
}

interface IProps extends CONFIG_PAGE.ICommonProps {
  data: { list: IData[] }
  props: {
    visible: boolean
  }
}

const noop = () => { };
const TableBoard = (props: ITableBoardProps) => {
  const { props: configProps, execOperation = noop, updateState = noop } = props
  const { title, subtitle, description, table, extraInfo } = configProps;

  return (
    <div className='table-board'>
      <Title props={title} type="Title" execOperation={execOperation} updateState={updateState} />
      <div className="card">
        <Title props={subtitle} type="Title" execOperation={execOperation} updateState={updateState} />
        <Text props={description} type="Text" execOperation={execOperation} updateState={updateState} />
        <Table
          props={table.props}
          data={table.data}
          operations={table.operations}
          execOperation={execOperation}
          type="Table"
          updateState={updateState}
        />
        <Text
          props={extraInfo.props}
          operations={extraInfo.operations}
          execOperation={execOperation}
          type="Text"
          updateState={updateState}
        />
      </div>
    </div>
  )
}

const TableGroup = (props: IProps) => {
  const { props: configProps, state: propsState, data, operations, execOperation = noop, updateState = noop } = props;
  const [{ pageNo, list: combineList = [], total }, updater, update] = useUpdate({
    pageNo: propsState?.pageNo || 1,
    total: propsState?.total,
    list: [],
  } || {}) as any;
  const { visible } = configProps;
  const showLoadMore = total > Math.max(combineList.length, 0)


  // 将接口返回的list和之前的list进行拼接
  React.useEffect(() => {
    updater.list([...combineList, ...(data.list || [])])
  }, [updater, data.list])

  // 当propsState改变时去更新state
  React.useEffect(() => {
    update(propsState || {});
  }, [propsState, update]);

  // 加载更多
  const loadMore = () => {
    operations?.changePageNo && execOperation(operations?.changePageNo, { pageNo: pageNo + 1 })
  }

  if (!visible) {
    return null;
  }
  return (
    <div className="table-group">
      {
        map(combineList, item => {
          return (
            <TableBoard type="TableBoard" props={item} execOperation={execOperation} updateState={updateState} />
          )
        })
      }
      {showLoadMore && <div className='load-more' onClick={loadMore}>加载更多...</div>}
    </div>
  )
}

export default TableGroup;

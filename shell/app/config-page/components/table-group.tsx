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
      <div className='table-board-card'>
        <Title props={subtitle} type="Title" execOperation={execOperation} updateState={updateState} />
        <div className="mt12 ml32">
          <div className='mb12 ml8'>
            <Text props={description} type="Text" execOperation={execOperation} updateState={updateState} />
          </div>
          <Table
            props={table.props}
            data={table.data}
            operations={table.operations}
            execOperation={execOperation}
            type="Table"
            updateState={updateState}
          />
          <div className='mt12 ml8'>
            <Text
              props={extraInfo.props}
              operations={extraInfo.operations}
              execOperation={execOperation}
              type="Text"
              updateState={updateState}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TableGroup = (props: IProps) => {
  const { props: configProps, state: propsState, data, operations, execOperation = noop, updateState = noop } = props;
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
    operations?.changePageNo && execOperation(operations?.changePageNo, { pageNo: pageNo + 1 })
  }

  if (!visible) {
    return null;
  }
  return (
    <div className="cp-dice-table-group">
      {
        map(combineList, item => {
          return (
            <TableBoard type="TableBoard" props={item} execOperation={execOperation} updateState={updateState} />
          )
        })
      }
      {showLoadMore && <div className='load-more hover-active' onClick={loadMore}>加载更多...</div>}
    </div>
  )
}

export default TableGroup;

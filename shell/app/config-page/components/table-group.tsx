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
  projectTitle: CP_TITLE.IProps;
  issueTitle: CP_TITLE.IProps;
  issueBrief: CP_TEXT.IProps;
  issueTable: CP_TABLE.Props;
  moreIssueLink: CP_TEXT.Props;
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
  const { projectTitle, issueTitle, issueBrief, issueTable, moreIssueLink } = configProps;

  return (
    <div className='table-board'>
      <Title props={projectTitle} type="Title" execOperation={execOperation} updateState={updateState} />
      <div className="card">
        <Title props={issueTitle} type="Title" execOperation={execOperation} updateState={updateState} />
        <Text props={issueBrief} type="Text" execOperation={execOperation} updateState={updateState} />
        <Table
          props={issueTable.props}
          data={issueTable.data}
          operations={issueTable.operations}
          execOperation={execOperation}
          type="Table"
          updateState={updateState}
        />
        <Text
          props={moreIssueLink.props}
          operations={moreIssueLink.operations}
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
  const [{ pageNo, list: combineList = [], total }, updater, update] = useUpdate(propsState || {}) as any;

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

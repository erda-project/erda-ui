import * as React from 'react';
import { map, get } from 'lodash';
import Title from './title/title';
import Text from './text/text';
import { Table } from './table/table'

const TableBoard = (props: any) => {
  const { props: configProps } = props
  const { projectTitle, issueTitle, issueBrief, issueTable, moreIssueLink } = configProps;

  return (
    <div>
      <Title props={projectTitle} />
      <div style={{ backgroundColor: 'white' }}>
        <Title props={issueTitle} />
        {/* TODO:  text*/}
        <Text props={issueBrief} />
        <Table
          props={issueTable.props} data={issueTable.data}
        />
        <Text props={moreIssueLink} />
      </div>
    </div>
  )
}

const TableGroup = (props: any) => {
  const { props: configProps } = props;
  const { list } = configProps
  return (
    <div>
      {
        map(list, item => {
          console.log('item:', item)
          return (
            <TableBoard props={item} />
          )
        })
      }
      <div>加载更多...</div>
    </div>
  )
}

export default TableGroup;

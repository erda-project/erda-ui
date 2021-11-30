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
import DiceConfigPage, { useMock } from 'app/config-page';
import { getUrlQuery, statusColorMap } from 'config-page/utils';
import { updateSearch } from 'common/utils';
import { Badge } from 'common';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import routeInfoStore from 'core/stores/route';
import { Avatar, Select } from 'antd';
import { groupBy } from 'lodash';
import moment from 'moment';
import './index.scss';

interface IBarProps {
  task: CP_GANTT.IGanttData;
  isHover?: boolean;
}
const BarContentRender = (props: IBarProps) => {
  const { task, isHover } = props;
  const { extra, isLeaf } = task;

  return (
    <div className={`relative h-full ${!isLeaf ? 'top-1' : ''}`}>
      <div className={`flex items-center h-full ${!isLeaf ? 'justify-center' : ''}`}>
        {!isLeaf ? null : <IssueIcon type={extra?.type} size={'16px'} />}
        <span
          className={`text-white text-xs overflow-hidden whitespace-nowrap ${!isLeaf ? 'text-normal' : 'text-white'}`}
        >
          {task.name}
        </span>
      </div>
      <div className={`absolute text-sub text-xs ${isHover ? 'visible' : 'invisible'}`} style={{ right: -150, top: 1 }}>
        {moment(task.start).format('YYYY-MM-DD')} ~ {moment(task.end).format('YYYY-MM-DD')}
      </div>
    </div>
  );
};

const TaskListHeader = (props: { headerHeight: number; rowWidth: number }) => {
  const { headerHeight, rowWidth } = props;
  const [value, setValue] = React.useState('issue');
  return (
    <div style={{ height: headerHeight, width: rowWidth }}>
      <Select value={value} onChange={(v) => setValue(v)}>
        <Select.Option value="issue">按需求显示</Select.Option>
        <Select.Option value="user">按人员显示</Select.Option>
      </Select>
    </div>
  );
};

interface ITreeNodeProps {
  node: CP_GANTT.IGanttData;
  nodeList: CP_GANTT.IGanttData[];
}

const TreeNodeRender = (props: ITreeNodeProps) => {
  const { node, nodeList } = props;
  const { extra, level, name, id } = node;
  const tasksGroup = groupBy(nodeList || [], 'project');
  const subNodeStatus = tasksGroup[id] || [];
  const { status, type, user } = extra || {};
  console.log('------', status.status);
  return (
    <div className="flex items-center">
      {<IssueIcon type={type} size={'16px'} />}
      {level === 0 ? (
        <div className="flex-1 ml-1 w-0">
          <div className="truncate">{name}</div>
          <div className="flex issue-plan-status-total">
            {subNodeStatus.map((subItem, idx) => (
              <div
                key={`${idx}`}
                className="flex-1 h-1 issue-plan-status-total-item"
                style={{ backgroundColor: statusColorMap[status?.status] }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="truncate flex-1 ml-1">{name}</div>
          <div className="flex items-center ml-2">
            <Avatar size={16}>{user.slice(0, 1)}</Avatar>
            {status ? (
              <div className="ml-1">
                <Badge showDot={false} text={status.text} status={status?.status || 'default'} />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

const IssuePlan = () => {
  const [{ projectId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [urlQuery, setUrlQuery] = React.useState(query);

  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const inParams = { projectId, ...urlQuery };

  const urlQueryChange = (val: Obj) => setUrlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  return (
    <DiceConfigPage
      scenarioType={'issue-gantt'}
      scenarioKey={'issue-gantt'}
      useMock={useMock('crud')}
      forceMock
      inParams={inParams}
      customProps={{
        gantt: {
          props: {
            BarContentRender,
            TaskListHeader,
            TreeNodeRender,
          },
        },
        filter: {
          op: {
            onFilterChange: urlQueryChange,
          },
        },
      }}
    />
  );
};

export default IssuePlan;

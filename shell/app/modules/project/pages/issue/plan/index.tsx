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
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import { getUrlQuery, statusColorMap } from 'config-page/utils';
import { updateSearch } from 'common/utils';
import { Badge, ErdaIcon } from 'common';
import { useUpdate, useSwitch } from 'common/use-hooks';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import routeInfoStore from 'core/stores/route';
import { Avatar, Select } from 'antd';
import { groupBy } from 'lodash';
import moment from 'moment';
import i18n from 'i18n';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import './index.scss';

interface IBarProps {
  task: CP_GANTT.IGanttData;
  isHover?: boolean;
}
const BarContentRender = (props: IBarProps) => {
  const { task, isHover } = props;
  const { extra, isLeaf, styles } = task;
  const color = !isLeaf && styles?.backgroundColor;
  return (
    <div className={`relative h-full ${!isLeaf ? 'top-1' : ''}`}>
      <div className={`flex items-center h-full ${!isLeaf ? 'justify-center' : ''}`}>
        {!isLeaf ? null : <IssueIcon type={extra?.type} size={'16px'} />}
        <span
          style={color ? { color } : {}}
          className={`text-xs overflow-hidden whitespace-nowrap ${!isLeaf ? '' : 'text-white'}`}
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
    <div
      className="erda-task-list-header"
      style={{ height: headerHeight, width: rowWidth, lineHeight: `${headerHeight}px` }}
    >
      <Select
        className="erda-task-list-header-selector"
        dropdownClassName="py-0"
        suffixIcon={<ErdaIcon size={16} color="currentColor" type="caret-down" />}
        value={value}
        onChange={(v) => setValue(v)}
      >
        <Select.Option value="issue">{i18n.t('dop:display on demand')}</Select.Option>
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
  const [{ projectId, iterationId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const { iterationID: queryItertationID, type: _queryType } = query;
  const queryType = _queryType && _queryType.toUpperCase();
  const [urlQuery, setUrlQuery] = React.useState(query);
  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(false);
  const [{ filterObj, chosenIssueType, chosenIteration }, updater, update] = useUpdate({
    filterObj: {},
    chosenIteration: queryItertationID || 0,
    chosenIssueType: queryType as undefined | ISSUE_TYPE,
  });

  const reloadRef = React.useRef(null as any);

  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const inParams = { projectId, ...urlQuery };

  const urlQueryChange = (val: Obj) => setUrlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  const onCreate = (val: any) => {
    const filterIterationIDs = filterObj?.iterationIDs || [];
    const createTypeMap = {
      createRequirement: ISSUE_TYPE.REQUIREMENT,
      createTask: ISSUE_TYPE.TASK,
      createBug: ISSUE_TYPE.BUG,
    };
    const curType = createTypeMap[val?.key];
    if (curType) {
      // 当前选中唯一迭代，创建的时候默认为这个迭代，否则，迭代为0
      update({
        chosenIteration: iterationId || (filterIterationIDs.length === 1 ? filterIterationIDs[0] : 0),
        chosenIssueType: curType,
      });
      openDrawer();
    }
  };

  const reloadData = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  const onCloseDrawer = ({ hasEdited, isCreate, isDelete }: CloseDrawerParam) => {
    closeDrawer();
    update({
      chosenIteration: 0,
      chosenIssueType: undefined,
    });
    if (hasEdited || isCreate || isDelete) {
      // 有变更再刷新列表
      reloadData();
    }
  };

  return (
    <>
      <DiceConfigPage
        ref={reloadRef}
        scenarioType={'issue-gantt'}
        scenarioKey={'issue-gantt'}
        inParams={inParams}
        //useMock={useMock('crud')}
        //forceMock
        customProps={{
          topHead: {
            props: {
              isTopHead: true,
            },
          },
          ganttContainer: {
            props: { flexHeight: true },
          },
          page: {
            props: { fullHeight: true },
          },
          gantt: {
            props: {
              BarContentRender,
              TaskListHeader,
              TreeNodeRender,
            },
          },
          issueAddButton: {
            props: {
              disabled: false,
              menu: [
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'requirement',
                  operations: {
                    click: {
                      key: 'createRequirement',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                  text: i18n.t('requirement'),
                },
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'task',
                  operations: {
                    click: {
                      key: 'createTask',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.TASK',
                  text: i18n.t('task'),
                },
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'bug',
                  operations: {
                    click: {
                      key: 'createBug',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.BUG',
                  text: i18n.t('bug'),
                },
              ],
              operations: {
                click: {
                  key: '',
                  reload: false,
                },
              },
              suffixIcon: 'di',
              text: i18n.t('dop:create issue'),
              type: 'primary',
            },
            op: {
              // 添加：打开滑窗
              click: onCreate,
            },
          },
          filter: {
            op: {
              onFilterChange: (val: Obj) => {
                updater.filterObj(val);
                urlQueryChange(val);
              },
            },
          },
        }}
      />

      {chosenIssueType ? (
        <EditIssueDrawer
          iterationID={chosenIteration}
          issueType={chosenIssueType as ISSUE_TYPE}
          visible={drawerVisible}
          closeDrawer={onCloseDrawer}
        />
      ) : null}
    </>
  );
};

export default IssuePlan;

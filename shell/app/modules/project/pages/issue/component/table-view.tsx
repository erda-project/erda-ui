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
import { Table, Tooltip, Dropdown, Menu, Progress, Avatar } from 'antd';
import issueStore from 'project/stores/issues';
import moment from 'moment';
import { map, omit, get, find } from 'lodash';
import issueWorkflowStore from 'project/stores/issue-workflow';
import { MemberSelector, Icon as CustomIcon, FilterBarHandle } from 'common';
import { useUpdate } from 'common/use-hooks';
import { ColumnProps } from 'core/common/interface';
import { updateSearch, insertWhen } from 'common/utils';
import IssueTitleLabel from './title-label';
import {
  ISSUE_ICON,
  ISSUE_TYPE,
  ISSUE_STATE_MAP,
  ISSUE_PRIORITY_MAP,
  BUG_SEVERITY_MAP,
} from 'project/common/components/issue/issue-config';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import { useUpdateEffect, useEffectOnce } from 'react-use';

import { WithAuth, usePerm, getAuth, isCreator, isAssignee } from 'user/common';
import i18n from 'i18n';

import './table-view.scss';

interface IProps {
  filterObj?: Obj;
  issueType: ISSUE_TYPE;
  viewType?: string;
  onChosenIssue: (val: ISSUE.Issue) => void;
}
const QKey = FilterBarHandle.filterDataKey;

const unFinishState = [
  ISSUE_STATE_MAP.OPEN.value,
  ISSUE_STATE_MAP.WORKING.value,
  ISSUE_STATE_MAP.TESTING.value,
  ISSUE_STATE_MAP.REOPEN.value,
]; // 未完成状态枚举

const endTimeTip = (time: string, isFinished: boolean) => {
  const diffDay = moment(time).endOf('day').diff(moment().endOf('day'), 'day');
  let tip = <span>{i18n.t('dop:due in {num} days', { num: diffDay })}</span>;
  if (!isFinished) {
    if (diffDay === 0) {
      tip = <span className="text-warning">{i18n.t('due today')}</span>;
    } else if (diffDay === 1) {
      tip = <span className="text-warning">{i18n.t('due tomorrow')}</span>;
    } else if (diffDay < 0) {
      tip = <span className="text-danger">{i18n.t('dop:due {num} days ago', { num: -diffDay })}</span>;
    }
  }
  return <Tooltip title={moment(time).format('YYYY-MM-DD')}>{tip}</Tooltip>;
};

export const memberSelectorValueItem = (user: any) => {
  const { avatar, nick, name, label, value } = user;
  const displayName = nick || label || value || i18n.t('common:none');
  return (
    <div className="flex items-center hover-active issue-field-selector">
      <Avatar src={avatar} size="small">
        {nick ? nick.slice(0, 2) : i18n.t('none')}
      </Avatar>
      <span className={'ml-2 text-sm'} title={name}>
        {displayName}
      </span>
      <CustomIcon className="arrow-icon" type="di" />
    </div>
  );
};

interface IFieldProps {
  hasAuth: boolean;
  options: any[];
  value: string;
  record: ISSUE.Issue;
  field: string;
  updateRecord: (val: string, field: string, record: ISSUE.Issue) => void;
}

export const FieldSelector = (props: IFieldProps) => {
  const { hasAuth, options, value, updateRecord, record, field } = props;
  const chosenVal = get(
    find(options, (op) => op.value === value),
    'iconLabel',
  );
  const ValueRender = (
    <div className="flex items-center hover-active issue-field-selector" onClick={(e: any) => e.stopPropagation()}>
      {chosenVal}
      <CustomIcon type="di" className="arrow-icon" />
    </div>
  );

  if (hasAuth === false) return <WithAuth pass={hasAuth}>{ValueRender}</WithAuth>;

  const onClick = (e: any) => {
    e.domEvent.stopPropagation();
    updateRecord(e.key, field, record);
  };
  const menu = (
    <Menu onClick={onClick}>
      {map(options, (op) => (
        <Menu.Item disabled={op.disabled} key={op.value}>
          {op.iconLabel}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      {ValueRender}
    </Dropdown>
  );
};

const TableView = React.forwardRef((props: IProps, ref: any) => {
  const workflowStateList = issueWorkflowStore.useStore((s) => s.workflowStateList);
  const { filterObj: propsFilter, issueType, viewType, onChosenIssue } = props;
  const [params] = routeInfoStore.useStore((s) => [s.params]);
  const { getAllIssues, updateIssue } = issueStore.effects;
  const { clearIssues } = issueStore.reducers;
  const [issueList, issuePaging] = issueStore.useStore((s) => [s.issueList, s.issuePaging]);
  const [loading] = useLoading(issueStore, ['getAllIssues']);

  const authObj = usePerm((s) => s.project);
  const { pageSize, total } = issuePaging;

  const [{ filterObj }, updater] = useUpdate({
    filterObj: {
      type:
        issueType === ISSUE_TYPE.ALL
          ? [ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG, ISSUE_TYPE.EPIC]
          : issueType,
      pageNo: issuePaging.pageNo,
      ...propsFilter,
    } as Obj,
  });

  const getList = React.useCallback(
    (q: Obj = {}) => {
      getAllIssues(omit({ ...filterObj, ...q }, QKey));
    },
    [filterObj, getAllIssues],
  );

  React.useEffect(() => {
    if (ref) {
      // eslint-disable-next-line no-param-reassign
      ref.current = {
        reloadData: () => getList({ pageNo: 1 }),
      };
    }
  }, [ref, getList]);

  useEffectOnce(() => {
    if (propsFilter) {
      getList();
    }
    return () => {
      clearIssues({ type: ISSUE_TYPE.ALL });
      updateSearch({ pageNo: undefined });
    };
  });

  const onClick = (item: ISSUE.Issue) => {
    onChosenIssue(item);
  };

  React.useEffect(() => {
    // 把_Q_的放路由最后
    updateSearch(
      { ...propsFilter, pageNo: filterObj.pageNo, viewType },
      {
        sort: (a: string, b: string) => (a === QKey ? 1 : b === QKey ? -1 : 0),
      },
    );
  }, [propsFilter, filterObj.pageNo, viewType]);

  useUpdateEffect(() => {
    updater.filterObj((prev: Obj) => ({ ...prev, ...propsFilter }));
  }, [propsFilter, updater]);

  useUpdateEffect(() => {
    getList({ ...filterObj });
  }, [filterObj]);

  const updateRecord = (val: string, key: string, record: ISSUE.Issue) => {
    const updateVal = key === 'state' ? +val : val;
    updateIssue({ ...record, [key]: updateVal } as any).then(() => {
      getList();
    });
  };

  const columns: Array<ColumnProps<ISSUE.Issue>> = [
    {
      title: <span className="pl-2">{i18n.t('title')}</span>,
      // width: 400,
      dataIndex: 'title',
      className: 'title',
      key: 'title',
      render: (val: string, record: ISSUE.Issue) => {
        return <IssueTitleLabel data={record} onClick={() => onClick(record)} />;
      },
    },
    ...insertWhen(issueType === ISSUE_TYPE.REQUIREMENT, [
      {
        title: i18n.t('dop:progress'),
        width: 100,
        dataIndex: 'issueSummary',
        key: 'issueSummary',
        render: (val: Obj | null) => {
          if (!val) {
            return '-';
          }
          const { processingCount = 0, doneCount = 0 } = val || { processingCount: 3, doneCount: 3 };
          const sum = processingCount + doneCount;
          if (!sum) return '';
          const percent = Math.round((doneCount / sum) * 10000) / 100;
          return <Progress percent={percent} />;
        },
      },
    ]),
    // ...insertWhen(issueType === ISSUE_TYPE.TASK, [
    //   {
    //     title: i18n.t('dop:progress'),
    //     width: 100,
    //     dataIndex: 'issueSummary',
    //     key: 'issueSummary',
    //     render: (val: Obj, record: ISSUE.Issue) => {
    //       const { processingCount = 0, doneCount = 0 } = val || { processingCount: 3, doneCount: 3 };
    //       const sum = processingCount + doneCount;
    //       if (!sum) return '';
    //       const percent = Math.round((doneCount / sum) * 10000) / 100;
    //       return <Progress percent={percent} />;
    //     },
    //   },
    // ]),
    {
      title: i18n.t('dop:priority'),
      width: 120,
      dataIndex: 'priority',
      key: 'priority',
      render: (val: string, record: ISSUE.Issue) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(authObj[record.type.toLowerCase()].edit, checkRole);
        return (
          <FieldSelector
            field="priority"
            hasAuth={editAuth}
            value={val || ISSUE_PRIORITY_MAP.NORMAL.value}
            record={record}
            updateRecord={updateRecord}
            options={map(ISSUE_PRIORITY_MAP)}
          />
        );
      },
    },
    ...insertWhen(issueType === ISSUE_TYPE.BUG, [
      {
        title: i18n.t('dop:severity'),
        width: 120,
        dataIndex: 'severity',
        key: 'severity',
        render: (val: string, record: ISSUE.Issue) => {
          const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
          const editAuth = getAuth(authObj[record.type.toLowerCase()].edit, checkRole);
          return (
            <FieldSelector
              field="severity"
              hasAuth={editAuth}
              value={val}
              record={record}
              updateRecord={updateRecord}
              options={map(BUG_SEVERITY_MAP)}
            />
          );
        },
      },
    ]),
    {
      title: i18n.t('status'),
      width: 120,
      dataIndex: 'state',
      key: 'state',
      render: (val: string, record: ISSUE.Issue) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const updateStatusAuth = getAuth(authObj[record.type.toLowerCase()].updateStatus, checkRole);
        const { issueButton } = record;
        const opts = [] as any;
        map(issueButton, (item) => {
          opts.push({
            disabled: !item.permission,
            value: item.stateID,
            iconLabel: (
              <div className="flex items-center">
                {ISSUE_ICON.state[item.stateBelong]}
                {item.stateName}
              </div>
            ),
          });
        });

        return (
          <FieldSelector
            field="state"
            hasAuth={updateStatusAuth}
            value={val}
            record={record}
            updateRecord={updateRecord}
            options={opts}
          />
        );
      },
    },
    {
      title: i18n.t('dop:assignee'),
      width: 120,
      dataIndex: 'assignee',
      key: 'assignee',
      render: (userId: string, record: ISSUE.Issue) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(authObj[record.type.toLowerCase()].edit, checkRole);
        return (
          <WithAuth pass={editAuth}>
            <MemberSelector
              scopeType="project"
              scopeId={params.projectId}
              dropdownMatchSelectWidth={false}
              valueItemRender={memberSelectorValueItem}
              className="issue-member-selector"
              allowClear={false}
              disabled={!editAuth}
              value={userId}
              onChange={(val) => {
                updateRecord(val, 'assignee', record);
              }}
            />
          </WithAuth>
        );
      },
    },
    {
      title: i18n.t('deadline'),
      width: 160,
      dataIndex: 'planFinishedAt',
      key: 'planFinishedAt',
      render: (val: string, record: ISSUE.Issue) => {
        const curStateBelong = get(find(workflowStateList, { stateID: record.state }), 'stateBelong');
        // 当前未完成且时间临近或逾期，则提示
        const timeTip = endTimeTip(val, !unFinishState.includes(curStateBelong));
        return val ? timeTip : '-';
      },
    },
  ];

  return (
    <div className="p-3 rounded issue-table-view">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={issueList}
        loading={loading}
        pagination={{
          current: +filterObj.pageNo,
          pageSize,
          total,
          onChange: (pgNo) => {
            updater.filterObj({ ...filterObj, pageNo: pgNo });
          },
        }}
        scroll={{ x: '100%' }}
      />
    </div>
  );
});

export default TableView;

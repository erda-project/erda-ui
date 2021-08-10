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

import { useUpdate, MemberSelector, IF } from 'common';
import { Button, Select, Table, Popconfirm, Title, Tooltip } from 'app/nusi';
import React, { useImperativeHandle } from 'react';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import issueStore from 'project/stores/issues';
import { useMount } from 'react-use';
import { goTo } from 'common/utils';
import { debounce, map, filter, find } from 'lodash';
import iterationStore from 'project/stores/iteration';
import { Link } from 'react-router-dom';
import { getIssues as getIssuesService } from 'project/services/issue';
import { getIssueTypeOption, IssueIcon } from 'project/common/components/issue/issue-icon';
import { ISSUE_OPTION, ISSUE_TYPE, ISSUE_ICON, ISSUE_PRIORITY_MAP } from 'project/common/components/issue/issue-config';
import { WithAuth, usePerm, getAuth, isAssignee, isCreator } from 'user/common';
import moment from 'moment';
import { IssueForm } from 'project/pages/backlog/issue-item';
import './issue-relation.scss';
import IterationSelect from './iteration-select';

interface IProps {
  issue: ISSUE.IssueType;
  iterationID: number | undefined;
  issueType?: string;
  onRelationChange?: () => void;
}
type IDefaultIssueType = 'BUG' | 'TASK' | 'REQUIREMENT';

const ButtonGroup = Button.Group;
const { Option } = Select;

// 打开任务详情时，关联事项默认选中bug，打开缺陷详情或者需求详情时，关联事项默认选中task
const initTypeMap = {
  TASK: 'BUG',
  REQUIREMENT: 'TASK',
  BUG: 'TASK',
};

export const IssueRelation = React.forwardRef((props: IProps, ref: any) => {
  const { issue, iterationID, onRelationChange, issueType: propsIssueType } = props;

  const [relatingList, setRealtingList] = React.useState([] as ISSUE.IssueType[]);
  const [relatedList, setRelatedList] = React.useState([] as ISSUE.IssueType[]);
  const [activeButtonType, setActiveButtonType] = React.useState('');

  const [{ projectId }, { type: routeIssueType }] = routeInfoStore.getState((s) => [s.params, s.query]);
  const issueType = propsIssueType || routeIssueType;
  const defaultIssueType = initTypeMap[issueType];
  const { getIssueRelation, addIssueRelation, deleteIssueRelation } = issueStore.effects;
  const issueDetail = issueStore.useStore((s) => s[`${issueType.toLowerCase()}Detail`]);

  const getList = React.useCallback(() => {
    getIssueRelation({ id: issue.id }).then((res) => {
      setRealtingList(res[0]);
      setRelatedList(res[1]);
    });
  }, [getIssueRelation, issue]);

  useImperativeHandle(ref, () => ({ getList }), [getList]);

  const curIterationID = React.useMemo(() => {
    return issueDetail.iterationID || iterationID;
  }, [issueDetail.iterationID, iterationID]);

  useMount(() => {
    getList();
  });

  const authObj = usePerm((s) => s.project.task);

  const updateRecord = (record: ISSUE.Task, key: string, val: any) => {
    issueStore.effects.updateIssue({ ...record, [key]: val }).finally(() => {
      getIssueRelation({ id: issue.id });
    });
  };
  const columns = [
    {
      title: i18n.t('{name} title', { name: i18n.t('project:issue') }),
      dataIndex: 'title',
      render: (v: string, record: ISSUE.IssueType) => {
        const { type, id, iterationID: _iterationID } = record;
        const url =
          type === ISSUE_TYPE.TICKET
            ? goTo.resolve.ticketDetail({ projectId, issueId: id })
            : _iterationID === -1
            ? goTo.resolve.backlog({ projectId, issueId: id, issueType: type })
            : goTo.resolve.issueDetail({
                projectId,
                issueType: type.toLowerCase(),
                issueId: id,
                iterationId: _iterationID,
              });
        return (
          <Tooltip title={`${v}`}>
            <Link to={url} target="_blank" className="flex items-center justify-start  w-full">
              <IssueIcon type={record.type as any} />
              <span className="flex-1 nowrap">{`${v}`}</span>
            </Link>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('status'),
      dataIndex: 'state',
      width: 100,
      render: (v: number, record: any) => {
        const currentState = find(record?.issueButton, (item) => item.stateID === v);
        return currentState ? (
          <div className="flex items-center">
            {ISSUE_ICON.state[currentState.stateBelong]}
            {currentState.stateName}
          </div>
        ) : undefined;
      },
    },
    {
      title: i18n.t('project:priority'),
      dataIndex: 'priority',
      width: 80,
      render: (v: string) => (v ? ISSUE_PRIORITY_MAP[v]?.iconLabel : null),
    },
    {
      title: i18n.t('project:assignee'),
      dataIndex: 'assignee',
      width: 240,
      render: (userId: string, record: ISSUE.Task) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(authObj.edit, checkRole);
        return (
          <WithAuth pass={editAuth}>
            <MemberSelector
              scopeType="project"
              scopeId={projectId}
              allowClear={false}
              disabled={!editAuth}
              value={userId}
              dropdownMatchSelectWidth={false}
              onChange={(val) => {
                updateRecord(record, 'assignee', val);
              }}
            />
          </WithAuth>
        );
      },
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => moment(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: null,
      dataIndex: 'operate',
      render: (text, record: ISSUE.IssueType) => {
        return [
          <WithAuth pass={authObj.edit.pass} key="remove-relation">
            <Popconfirm
              title={`${i18n.t('confirm remove relation?')}`}
              placement="bottom"
              onConfirm={() => onDelete(record)}
            >
              <span className="fake-link">{i18n.t('project:disassociate')}</span>
            </Popconfirm>
          </WithAuth>,
        ];
      },
      width: authObj.edit.pass ? 80 : 0,
    },
  ];

  const addRelation = (val: number) => {
    addIssueRelation({ relatedIssues: val, id: issue.id, projectId: +projectId }).then(() => {
      onRelationChange && onRelationChange();
      getList();
    });
  };

  const onDelete = (val: ISSUE.IssueType) => {
    deleteIssueRelation({ id: issue.id, relatedIssueID: val.id }).then(() => {
      onRelationChange && onRelationChange();
      getList();
    });
  };

  return (
    <div className="issue-relation">
      <div>
        {issue.type === ISSUE_TYPE.TICKET ? null : (
          // (
          //   <TransformToIssue issue={issue as ISSUE.Ticket} onSaveRelation={addRelation} />
          // )
          <>
            <div>
              <WithAuth pass={usePerm((s) => s.project.requirement.create.pass)}>
                <Button
                  type={activeButtonType === 'create' ? 'primary' : 'default'}
                  onClick={() => setActiveButtonType('create')}
                >
                  {i18n.t('project:create and relate to the issue')}
                </Button>
              </WithAuth>
              <WithAuth pass={authObj.edit.pass}>
                <Button
                  type={activeButtonType === 'exist' ? 'primary' : 'default'}
                  onClick={() => setActiveButtonType('exist')}
                  className="ml-3"
                >
                  {i18n.t('project:related to existing issues')}
                </Button>
              </WithAuth>
            </div>
            <IF check={activeButtonType === 'create'}>
              <AddNewIssue
                onSaveRelation={addRelation}
                onCancel={() => setActiveButtonType('')}
                iterationID={curIterationID}
                defaultIssueType={defaultIssueType}
              />
            </IF>
            <IF check={activeButtonType === 'exist'}>
              <AddIssueRelation
                editAuth
                onSave={addRelation}
                onCancel={() => setActiveButtonType('')}
                projectId={projectId}
                iterationID={curIterationID}
                currentIssue={issue}
                defaultIssueType={defaultIssueType}
              />
            </IF>
          </>
        )}
      </div>
      <Title level={2} className="my-2" title={i18n.t('project:related to these issues')} />
      <Table
        columns={columns}
        dataSource={relatingList}
        pagination={false}
        rowKey={(rec: ISSUE.IssueType, i: number) => `${i}${rec.id}`}
        scroll={{ x: '100%' }}
      />
      <Title level={2} className="mt-4 mb-2" title={i18n.t('project:related by these issues')} />
      <Table
        columns={columns}
        dataSource={relatedList}
        pagination={false}
        rowKey={(rec: ISSUE.IssueType, i: number) => `${i}${rec.id}`}
        scroll={{ x: '100%' }}
      />
    </div>
  );
});

interface IAddProps {
  editAuth: boolean;
  projectId: string;
  currentIssue: ISSUE.IssueType;
  iterationID: number | undefined;
  defaultIssueType: IDefaultIssueType;
  onSave: (v: number) => void;
  onCancel: () => void;
}

const initState = {
  issueList: [],
  chosenIssueType: undefined as undefined | string,
  chosenIssue: undefined as undefined | number,
  chosenIterationID: undefined as undefined | number | 'ALL',
};

const AddIssueRelation = ({
  onSave,
  editAuth,
  projectId,
  iterationID,
  currentIssue,
  onCancel,
  defaultIssueType,
}: IAddProps) => {
  const [{ chosenIssueType, chosenIterationID, issueList, chosenIssue }, updater, update] = useUpdate({
    ...initState,
    chosenIterationID: 'ALL',
    chosenIssueType: defaultIssueType,
  });

  const getIssueList = (extra: Obj = {}) => {
    const type = chosenIssueType || extra.type || map(ISSUE_OPTION);
    const validIterationID = chosenIterationID === 'ALL' ? '' : chosenIterationID;
    getIssuesService({
      projectID: +projectId,
      pageSize: 50,
      pageNo: 1,
      iterationID: validIterationID,
      ...extra,
      type,
    }).then((res: any) => {
      if (res.success) {
        res.data.list && updater.issueList(res.data.list);
      }
    });
  };

  const onClose = () => {
    update({
      chosenIssue: undefined,
      chosenIssueType: defaultIssueType,
      chosenIterationID: iterationID,
      issueList: [],
    });
    onCancel();
  };

  React.useEffect(() => {
    getIssueList({ type: chosenIssueType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenIssueType]);

  React.useEffect(() => {
    getIssueList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenIterationID]);

  const debounceSearch = debounce((val: string) => {
    getIssueList({ title: val });
  }, 500);

  return (
    <div className="issue-relation-box mt-3">
      <div className="flex items-center justify-start">
        <div className="mr-3">{i18n.t('project:filter condition')}:</div>
        <IterationSelect
          value={chosenIterationID}
          placeholder={i18n.t('project:owned iteration')}
          width="174px"
          onChange={(v: number) => {
            update({ chosenIterationID: v, chosenIssue: undefined });
          }}
          disabled={!editAuth}
          addAllOption
        />
        <Select
          className="ml-2"
          style={{ width: '174px' }}
          onChange={(v: any) => update({ chosenIssueType: v, chosenIssue: undefined })}
          value={chosenIssueType}
          allowClear
          placeholder={i18n.t('project:issue type')}
        >
          {getIssueTypeOption()}
        </Select>
      </div>
      <div className="flex justify-between items-center">
        <Select
          className="issue-list flex-1 mt-3"
          onSelect={(v: any) => updater.chosenIssue(v)}
          showSearch
          value={chosenIssue}
          filterOption={false}
          onSearch={(v: string) => debounceSearch(v)}
          getPopupContainer={() => document.body}
          disabled={!chosenIterationID}
          placeholder={i18n.t('please select {name}', { name: i18n.t('project:issue') })}
        >
          {map(
            filter(issueList, (item) => item.id !== currentIssue.id),
            (issue) => {
              return (
                <Option key={issue.id} value={issue.id}>
                  <div className="flex items-center justify-start">
                    <IssueIcon type={issue.type} />
                    <span className="nowrap">{issue.title}</span>
                  </div>
                </Option>
              );
            },
          )}
        </Select>

        <Button
          type="primary"
          className="ml-3 mt-3"
          disabled={!chosenIssue}
          onClick={() => {
            if (chosenIssue) {
              onSave(chosenIssue);
              updater.chosenIssue(undefined);
            }
          }}
        >
          {i18n.t('ok')}
        </Button>
        <Button type="link" className="mt-3" onClick={onClose}>
          {i18n.t('cancel')}
        </Button>
      </div>
    </div>
  );
};

interface IAddNewIssueProps {
  iterationID: number | undefined;
  defaultIssueType: IDefaultIssueType;
  onSaveRelation: (v: number) => void;
  onCancel: () => void;
}

const AddNewIssue = ({ onSaveRelation, iterationID, onCancel, defaultIssueType }: IAddNewIssueProps) => {
  const { createIssue } = iterationStore.effects;
  const { projectId } = routeInfoStore.getState((s) => s.params);

  return (
    <IssueForm
      key="add"
      className="mt-3"
      onCancel={onCancel}
      defaultIssueType={defaultIssueType}
      onOk={(val: ISSUE.BacklogIssueCreateBody) => {
        return createIssue({
          // 创建事件
          projectID: +projectId,
          iterationID: +iterationID,
          priority: 'LOW',
          ...val,
        }).then((res: number) => {
          onSaveRelation(res); // 添加关联
        });
      }}
    />
  );
};

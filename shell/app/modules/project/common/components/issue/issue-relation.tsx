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

import { Dropdown } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { ErdaIcon, SimpleTabs, Table as ErdaTable, UserInfo, ConfigurableFilter, MemberSelector } from 'common';
import { useUpdate } from 'common/use-hooks';
import { goTo, insertWhen } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import issueWorkflowStore from 'project/stores/issue-workflow';
import i18n from 'i18n';
import { map } from 'lodash';
import moment from 'moment';
import {
  ISSUE_OPTION,
  ISSUE_TYPE,
  ISSUE_TYPE_MAP,
  ISSUE_PRIORITY_LIST,
  ISSUE_COMPLEXITY_MAP,
} from 'project/common/components/issue/issue-config';
import { BACKLOG_ISSUE_TYPE, IssueForm, IssueItem } from 'project/pages/backlog/issue-item';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import { getIssueRelation, getIssues } from 'project/services/issue';
import { getProjectIterations } from 'project/services/project-iteration';
import issueStore from 'project/stores/issues';
import iterationStore from 'project/stores/iteration';
import labelStore from 'project/stores/label';
import React from 'react';
import { usePerm, WithAuth } from 'user/common';
import { useAddMrRelation } from './add-mr-relation';
import './issue-relation.scss';
import { IssueTestCaseRelation } from './issue-testCase-relation';

export enum RelationType {
  Inclusion = 'inclusion',
  Connection = 'connection',
}
type IDefaultIssueType = 'BUG' | 'TASK' | 'REQUIREMENT';

// 打开任务详情时，关联事项默认选中bug，打开缺陷详情或者需求详情时，关联事项默认选中task
// 如果是包含关系时，需求默认选中任务，任务默认选中需求
const initTypeMap = {
  [RelationType.Connection]: {
    TASK: 'BUG',
    REQUIREMENT: 'TASK',
    BUG: 'TASK',
  },
  [RelationType.Inclusion]: {
    TASK: 'REQUIREMENT',
    REQUIREMENT: 'TASK',
  },
};

interface IProps {
  list?: ISSUE.IssueType[];
  issueDetail: ISSUE.IssueType;
  iterationID: number | undefined;
  type: RelationType;
  setExpand: (open: boolean) => void;
  onRelationChange?: () => void;
}

const useIssueRelation = (props: IProps) => {
  const { setExpand, list, issueDetail, iterationID, onRelationChange, type: relationType } = props;

  const [activeButtonType, setActiveButtonType] = React.useState('');

  const [{ projectId }, { type: routeIssueType }] = routeInfoStore.getState((s) => [s.params, s.query]);
  const issueType = issueDetail?.type || (Array.isArray(routeIssueType) ? routeIssueType[0] : routeIssueType);
  const defaultIssueType = initTypeMap[relationType][issueType];
  const { addIssueRelation, deleteIssueRelation } = issueStore.effects;

  const curIterationID = React.useMemo(() => {
    return issueDetail?.iterationID || iterationID;
  }, [issueDetail?.iterationID, iterationID]);

  const authObj = usePerm((s) => s.project.task);

  const addRelation = (idList: number[]) => {
    addIssueRelation({
      relatedIssues: idList,
      id: issueDetail.id,
      projectId: +projectId,
      // relatedTo and relatedBy is both 'connection'
      type: relationType,
    }).then(() => {
      onRelationChange && onRelationChange();
      setExpand(true);
    });
  };

  const onDelete = (val: Merge<ISSUE.IssueType, { isRelatedBy?: boolean }>, type: RelationType) => {
    const payload = val.isRelatedBy
      ? { id: val.id, relatedIssueID: issueDetail.id, type }
      : { id: issueDetail.id, relatedIssueID: val.id, type };
    deleteIssueRelation(payload).then(() => {
      onRelationChange && onRelationChange();
    });
  };
  const createAuth = usePerm((s) => s.project[issueType?.toLowerCase()]?.create.pass as boolean);
  if (!issueDetail) return [null, null];
  return [
    <React.Fragment key="1">
      <If condition={issueDetail.type !== ISSUE_TYPE.TICKET}>
        {/* <TransformToIssue issue={issue as ISSUE.Ticket} onSaveRelation={addRelation} /> */}

        <WithAuth pass={createAuth}>
          <div
            className="h-7 mr-2 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
            onClick={() => {
              setActiveButtonType('create');
              setExpand(true);
            }}
          >
            <ErdaIcon type="plus" size={20} />
          </div>
        </WithAuth>
        <AddIssueRelation
          editAuth={authObj.edit.pass}
          onSave={addRelation}
          projectId={projectId}
          iterationID={curIterationID}
          currentIssue={issueDetail}
          defaultIssueType={defaultIssueType}
          relationType={relationType}
          issueType={issueType}
        />
      </If>
    </React.Fragment>,
    <React.Fragment key="2">
      <AddNewIssue
        className={activeButtonType === 'create' ? '' : 'hidden'}
        onSaveRelation={addRelation}
        onCancel={() => setActiveButtonType('')}
        iterationID={curIterationID}
        defaultIssueType={defaultIssueType}
        typeDisabled={relationType === RelationType.Inclusion}
      />
      <If condition={relationType === RelationType.Inclusion && issueType === 'REQUIREMENT' && !!list?.length}>
        <div className="rounded-sm border border-solid border-default-1">
          {list?.map((item) => (
            <IssueItem
              data={item}
              editable
              key={item.id}
              showIteration
              afterUpdate={() => onRelationChange?.()}
              onClickIssue={(record) => {
                goTo(goTo.pages.issueDetail, {
                  projectId,
                  issueType: record.type.toLowerCase(),
                  issueId: record.id,
                  iterationId: record.iterationID,
                  jumpOut: true,
                });
              }}
              onDelete={(val) => onDelete(val, RelationType.Inclusion)}
              deleteConfirmText={(name: string) => i18n.t('dop:Are you sure to disinclude {name}', { name })}
              deleteText={i18n.t('dop:release relationship')}
              issueType={BACKLOG_ISSUE_TYPE.undoneIssue}
              showStatus
              undraggable
            />
          ))}
        </div>
      </If>

      <If condition={relationType === RelationType.Connection && !!list?.length}>
        <div className="rounded-sm border border-solid border-default-1">
          {list?.map((item) => (
            <IssueItem
              data={item}
              key={item.id}
              editable
              showIteration
              afterUpdate={() => onRelationChange?.()}
              onClickIssue={(record) => {
                goTo(record.type === 'TICKET' ? goTo.pages.ticketDetail : goTo.pages.issueDetail, {
                  projectId,
                  issueType: record.type.toLowerCase(),
                  issueId: record.id,
                  iterationId: record.iterationID,
                  jumpOut: true,
                });
              }}
              onDelete={(val) => onDelete(val, RelationType.Connection)}
              deleteConfirmText={(name: string) =>
                i18n.t('dop:Are you sure to release relationship with {name}', { name })
              }
              deleteText={i18n.t('dop:release relationship')}
              issueType={BACKLOG_ISSUE_TYPE.undoneIssue}
              showStatus
              undraggable
            />
          ))}
        </div>
      </If>
    </React.Fragment>,
  ];
};

interface IIssueSectionProps {
  title: string;
  expand: boolean;
  data?: any[];
  activeTabKey?: string;
  tabs?: Array<{
    text: string;
    key: string;
    [k: string]: any;
  }>;
  onSelectTab?: (key: string) => void;
  operations: JSX.Element | null;
  content: JSX.Element | null;
  setExpand: (current: boolean) => void;
}
const IssueSection = ({
  title,
  expand,
  setExpand,
  activeTabKey,
  tabs,
  onSelectTab,
  data,
  operations,
  content,
}: IIssueSectionProps) => {
  return (
    <div>
      <div className="relative h-12 flex-h-center text-primary font-medium">
        <span
          className="section-operate-title flex-h-center cursor-pointer hover:text-default"
          onClick={() => setExpand(!expand)}
        >
          <If condition={!!data?.length}>
            <span className="absolute left-[-20px] flex rounded-sm text-sub op-icon">
              <ErdaIcon size={20} type={`${expand ? 'down-4ffff0f4' : 'right-4ffff0i4'}`} />
            </span>
          </If>
          <span className="text-base">{title}</span>
        </span>
        <If condition={!tabs}>
          <span className="bg-default-06 leading-4 rounded-lg px-1 ml-1">{data?.length || 0}</span>
        </If>
        {tabs && onSelectTab && (
          <>
            <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
            <SimpleTabs
              value={activeTabKey || ''}
              tabs={tabs}
              onSelect={(key) => {
                onSelectTab(key);
                setExpand(true);
              }}
            />
          </>
        )}
        <If condition={!!(operations && operations?.props?.children)}>
          <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
          {operations}
        </If>
      </div>
      <If condition={expand}>{content}</If>
    </div>
  );
};

export const IssueInclusion = ({
  issueDetail,
  iterationID,
  setHasEdited,
}: {
  issueDetail: ISSUE.IssueType;
  iterationID?: number;
  setHasEdited: (val: boolean) => void;
}) => {
  const [expand, setExpand] = React.useState(false);
  const data = getIssueRelation.useData();
  const _iterationID = iterationID === -1 ? undefined : iterationID; // 如果当前事项是待规划的，待规划不在迭代列表里，默认“全部”时其实还是会带上 -1 作为 id，所以为-1 时就传 undefined
  React.useEffect(() => {
    if (issueDetail?.id) {
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
    }
  }, [issueDetail?.id]);

  const [operations, content] = useIssueRelation({
    setExpand,
    type: RelationType.Inclusion,
    list: data?.include,
    issueDetail,
    iterationID: _iterationID,
    onRelationChange: () => {
      setHasEdited(true);
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
    },
  });

  return (
    <IssueSection
      title={i18n.t('dop:Include')}
      expand={expand}
      setExpand={setExpand}
      data={data?.include}
      content={content}
      operations={operations}
    />
  );
};

interface IConnectionProps {
  issueDetail: ISSUE.IssueType;
  iterationID?: number;
  editAuth: boolean;
  setHasEdited: (val: boolean) => void;
}
export const IssueConnection = ({ issueDetail, iterationID, editAuth, setHasEdited }: IConnectionProps) => {
  const [expand, setExpand] = React.useState(false);
  const issueType = issueDetail?.type;
  const data = getIssueRelation.useData();
  const _iterationID = iterationID === -1 ? undefined : iterationID; // 如果当前事项是待规划的，待规划不在迭代列表里，默认“全部”时其实还是会带上 -1 作为 id，所以为-1 时就传 undefined
  const issueConnectionList = (data?.relatedTo || [])?.concat(
    (data?.relatedBy || []).map((item) => ({ ...item, isRelatedBy: true })),
  );
  const showCaseRelation = issueType === ISSUE_TYPE.BUG;
  const showMrRelation = issueType !== ISSUE_TYPE.TICKET;

  React.useEffect(() => {
    if (issueDetail.id) {
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
    }
  }, [issueDetail.id]);

  const [relateMrOperation, relateMrContent, relateMrList] = useAddMrRelation({
    expand,
    issueDetail,
    afterAdd: () => getIssueStreams({ type: issueType, id: issueDetail.id, pageNo: 1, pageSize: 100 }),
    editAuth,
  });

  const [relateIssueOperation, relateIssueList] = useIssueRelation({
    setExpand,
    type: RelationType.Connection,
    list: issueConnectionList,
    issueDetail,
    iterationID: _iterationID,
    onRelationChange: () => {
      setHasEdited(true);
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
    },
  });

  const tabs = [
    {
      key: 'issue',
      text: `${i18n.t('dop:Issue')}(${issueConnectionList.length})`,
      data: issueConnectionList,
      operations: relateIssueOperation,
      content: relateIssueList,
    },
    ...insertWhen(showCaseRelation, [
      {
        key: 'testcase',
        text: `${i18n.t('dop:Testcase')}(${issueDetail?.testPlanCaseRels?.length})`,
        data: issueDetail?.testPlanCaseRels,
        operations: null,
        content: <IssueTestCaseRelation list={issueDetail?.testPlanCaseRels || []} />,
      },
    ]),
    ...insertWhen(showMrRelation, [
      {
        key: 'mr',
        text: `MR(${relateMrList.length})`,
        data: relateMrList,
        operations: relateMrOperation,
        content: relateMrContent,
      },
    ]),
  ];
  const [activeTabKey, setActiveTabKey] = React.useState(tabs[0].key);
  const { getIssueStreams } = issueStore.effects;
  if (!issueDetail) return null;
  const curTab = tabs.find((t) => t.key === activeTabKey) as typeof tabs[0];

  return (
    <IssueSection
      title={i18n.t('dop:Reference')}
      expand={expand}
      setExpand={setExpand}
      activeTabKey={activeTabKey}
      tabs={tabs}
      onSelectTab={setActiveTabKey}
      data={curTab.data}
      content={curTab.content}
      operations={curTab.operations}
    />
  );
};

interface IAddProps {
  editAuth: boolean;
  projectId: string;
  currentIssue?: ISSUE.IssueType;
  iterationID?: number | undefined;
  defaultIssueType?: IDefaultIssueType;
  onSave: (v: number[], issues: ISSUE.IssueType[]) => void;
  relationType: RelationType;
  issueType: IDefaultIssueType;
}

const typeList = [
  { label: i18n.t('requirement'), value: 'REQUIREMENT' },
  { label: i18n.t('task'), value: 'TASK' },
  { label: i18n.t('bug'), value: 'BUG' },
];

export const AddIssueRelation = ({
  onSave,
  editAuth,
  projectId,
  iterationID,
  currentIssue,
  defaultIssueType = 'TASK',
  relationType,
  issueType,
}: IAddProps) => {
  const [{ filterData, total, visible, issueList, iterationList }, updater, update] = useUpdate({
    visible: false,
    issueList: [],
    total: 0,
    filterData: {
      title: '',
      iterationID,
      type: defaultIssueType,
      pageNo: 1,
      pageSize: 7,
      startFinishedAt: '',
      endFinishedAt: '',
      startCreatedAt: '',
      endCreatedAt: '',
    },
    iterationList: [] as ITERATION.Detail[],
  });

  const workflowStateList = issueWorkflowStore.useStore((s) => s.workflowStateList);
  const stateList = React.useMemo(() => {
    if (relationType === RelationType.Inclusion) {
      return workflowStateList
        .filter((item) => item.issueType === { REQUIREMENT: 'TASK', TASK: 'BUG' }[issueType])
        .map((state) => ({ label: state.stateName, value: state.stateID }));
    } else {
      return typeList.map((item) => ({
        ...item,
        children: workflowStateList
          .filter((state) => state.issueType === item.value)
          .map((state) => ({ label: state.stateName, value: state.stateID })),
      }));
    }
  }, [workflowStateList, relationType, issueType]);

  const labelList = labelStore.useStore((s) => s.list);
  const { getLabels } = labelStore.effects;

  React.useEffect(() => {
    if (!labelList?.length) {
      getLabels({ type: 'issue' });
    }
  }, [labelList, getLabels, projectId]);

  const getIssueList = React.useCallback(
    (extra?: Obj) => {
      if (visible && projectId) {
        getIssues({
          ...filterData,
          ...extra,
          projectID: +projectId,
          notIncluded: relationType === RelationType.Inclusion,
        }).then((res) => {
          if (res.data) {
            updater.issueList(res.data?.list || []);
            updater.total(res.data?.total || 0);
          }
        });
      }
    },
    [filterData, projectId, relationType, updater, visible],
  );

  React.useEffect(() => {
    if (visible && !iterationList.length) {
      getProjectIterations({
        projectID: +projectId,
        pageSize: 50,
      }).then((res) => {
        if (res.data) {
          updater.iterationList(res.data.list || []);
        }
      });
    }
  }, [iterationList.length, projectId, updater, visible]);

  React.useEffect(() => {
    getIssueList();
  }, [filterData, getIssueList, projectId]);

  const columns: Array<ColumnProps<ISSUE.Issue>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: i18n.t('title'),
      dataIndex: 'title',
      width: 240,
      render: (title: string, record: ISSUE.Issue) => {
        return (
          <div className="flex-h-center">
            <IssueIcon size={'20'} type={record.type} className="mr-1" />
            {title}
          </div>
        );
      },
    },
    {
      title: i18n.t('assignee'),
      dataIndex: 'assignee',
      render: (id: string) => <UserInfo.RenderWithAvatar id={id} />,
    },
    {
      title: i18n.t('dop:planFinishedAt'),
      dataIndex: 'planFinishedAt',
      render: (item: string) => (item ? moment(item).format('YYYY/MM/DD') : i18n.t('unspecified')),
    },
  ];

  const dataSource = issueList.filter((item) => item.id !== currentIssue?.id) || [];

  const filterValue = React.useMemo(() => {
    const { startFinishedAt, endFinishedAt, startCreatedAt, endCreatedAt } = filterData;
    const finishedAt = startFinishedAt && endFinishedAt ? [startFinishedAt, endFinishedAt] : [];
    const createdAt = startCreatedAt && endCreatedAt ? [startCreatedAt, endCreatedAt] : [];
    return {
      ...filterData,
      finishedAt,
      createdAt,
    };
  }, [filterData]);

  const overlay = (
    <div className="w-[800px] shadow-card-lg bg-white">
      <div className="flex items-center justify-between px-4 py-3 font-medium">
        <span>{i18n.t('dop:choose issues')}</span>
        <ErdaIcon type="guanbi" size={20} className="hover-active" onClick={() => updater.visible(false)} />
      </div>
      <div className="px-4 pb-2">
        <ConfigurableFilter
          hideSave
          value={filterValue}
          fieldsList={[
            {
              key: 'title',
              type: 'input',
              label: i18n.t('title'),
              outside: true,
              placeholder: i18n.t('filter by {name}', { name: i18n.t('title') }),
            },
            ...insertWhen(relationType !== RelationType.Inclusion, [
              {
                label: i18n.t('dop:issue type'),
                type: 'select',
                key: 'type',
                options: map(ISSUE_OPTION, (item) => ISSUE_TYPE_MAP[item]),
                disabled: relationType === RelationType.Inclusion,
                placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:issue type') }),
              },
            ]),
            {
              label: i18n.t('dop:owned iteration'),
              type: 'select',
              key: 'iterationID',
              options:
                [{ title: i18n.t('dop:backlog'), id: -1 }, ...iterationList].map((item) => ({
                  label: item.title,
                  value: item.id,
                })) || [],
              placeholder: i18n.t('dop:owned iteration'),
              mode: 'single',
            },
            {
              label: i18n.t('state'),
              type: 'select',
              key: 'state',
              options: stateList,
              placeholder: i18n.t('filter by {name}', { name: i18n.t('state') }),
            },
            {
              label: i18n.t('label'),
              type: 'tagsSelect',
              key: 'label',
              options: labelList.map((item) => ({ color: item.color, label: item.name, value: item.id })),
              placeholder: i18n.t('filter by {name}', { name: i18n.t('label') }),
            },
            {
              label: i18n.t('dop:priority'),
              type: 'select',
              key: 'priority',
              options: ISSUE_PRIORITY_LIST.map((item) => ({ label: item.iconLabel, value: item.value })),
              placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:priority') }),
            },
            {
              label: i18n.t('dop:complexity'),
              type: 'select',
              key: 'complexity',
              options: map(ISSUE_COMPLEXITY_MAP, (item) => ({ label: item.iconLabel, value: item.value })),
              placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:complexity') }),
            },
            {
              label: i18n.t('creator'),
              type: 'custom',
              key: 'creator',
              placeholder: i18n.t('filter by {name}', { name: i18n.t('creator') }),
              getComp: () => <MemberSelector scopeType="project" scopeId={projectId} size="small" />,
            },
            {
              label: i18n.t('dop:assignee'),
              type: 'custom',
              key: 'assignee',
              placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:assignee') }),
              getComp: () => <MemberSelector scopeType="project" scopeId={projectId} size="small" />,
            },
            {
              label: i18n.t('deadline'),
              type: 'dateRange',
              key: 'finishedAt',
              placeholder: i18n.t('filter by {name}', { name: i18n.t('deadline') }),
            },
            {
              label: i18n.t('dop:creation date'),
              type: 'dateRange',
              key: 'createdAt',
              placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:creation date') }),
            },
          ]}
          onFilter={(v) => {
            const { finishedAt, createdAt, ...value } = v;
            updater.filterData({
              ...filterData,
              ...value,
              type: relationType === RelationType.Inclusion ? ['TASK'] : v.type,
              startFinishedAt: finishedAt?.[0],
              endFinishedAt: finishedAt?.[1],
              startCreatedAt: createdAt?.[0],
              endCreatedAt: createdAt?.[0],
            });
          }}
          zIndex={1060}
        />
      </div>

      <ErdaTable
        rowKey="id"
        hideHeader
        className="mx-1"
        rowSelection={{
          actions: [
            {
              key: 'batchSelect',
              name: i18n.t('choose'),
              onClick: (keys) => {
                onSave(
                  keys as number[],
                  dataSource.filter((item) => keys.includes(item.id)),
                );
                updater.visible(false);
              },
              isVisible: (keys) => keys.length > 0,
            },
          ],
        }}
        dataSource={dataSource}
        columns={columns}
        pagination={{
          hidePageSizeChange: true,
          current: filterData.pageNo || 1,
          pageSize: filterData.pageSize || 7,
          total,
          onChange: (no: number, size?: number) => {
            updater.filterData((prev: any) => ({ ...prev, pageNo: no, pageSize: size || prev.pageSize }));
            getIssueList({ pageNo: no, pageSize: size });
          },
        }}
      />
    </div>
  );

  return (
    <Dropdown overlay={overlay} visible={visible} trigger={['click']}>
      <WithAuth pass={editAuth}>
        <div
          className="h-7 mr-1 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
          onClick={() => updater.visible(true)}
        >
          <ErdaIcon type="xuanze-4gcjhec0" size={20} />
        </div>
      </WithAuth>
    </Dropdown>
  );
};

interface IAddNewIssueProps {
  iterationID: number | undefined;
  defaultIssueType: IDefaultIssueType;
  onSaveRelation: (v: number[]) => void;
  onCancel: () => void;
  typeDisabled?: boolean;
  className?: string;
}

const AddNewIssue = ({
  onSaveRelation,
  iterationID,
  onCancel,
  defaultIssueType,
  typeDisabled,
  className = '',
}: IAddNewIssueProps) => {
  const { createIssue } = iterationStore.effects;
  const { projectId } = routeInfoStore.getState((s) => s.params);

  return (
    <IssueForm
      key="add"
      className={`mt-3 mb-2 ${className}`}
      onCancel={onCancel}
      defaultIssueType={defaultIssueType}
      onOk={(val: ISSUE.BacklogIssueCreateBody) => {
        return createIssue({
          // 创建事件
          projectID: +projectId,
          iterationID: iterationID ? +iterationID : undefined,
          priority: 'LOW',
          ...val,
        }).then((id: number) => {
          onSaveRelation([id]); // 添加关联
          return id;
        });
      }}
      typeDisabled={typeDisabled}
    />
  );
};

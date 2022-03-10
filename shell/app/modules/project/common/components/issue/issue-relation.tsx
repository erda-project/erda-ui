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
import { ContractiveFilter, ErdaIcon, SimpleTabs, Table as ErdaTable, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import { goTo, insertWhen } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import { map } from 'lodash';
import moment from 'moment';
import { ISSUE_OPTION, ISSUE_TYPE, ISSUE_TYPE_MAP } from 'project/common/components/issue/issue-config';
import { BACKLOG_ISSUE_TYPE, IssueForm, IssueItem } from 'project/pages/backlog/issue-item';
import { getIssueRelation, getIssues } from 'project/services/issue';
import { getProjectIterations } from 'project/services/project-iteration';
import issueStore from 'project/stores/issues';
import iterationStore from 'project/stores/iteration';
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
    <>
      <If condition={issueDetail.type !== ISSUE_TYPE.TICKET}>
        {/* <TransformToIssue issue={issue as ISSUE.Ticket} onSaveRelation={addRelation} /> */}

        <WithAuth pass={createAuth}>
          <div
            className="h-7 mr-1 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
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
        />
      </If>
    </>,
    <>
      <If condition={activeButtonType === 'create'}>
        <AddNewIssue
          onSaveRelation={addRelation}
          onCancel={() => setActiveButtonType('')}
          iterationID={curIterationID}
          defaultIssueType={defaultIssueType}
          typeDisabled={relationType === RelationType.Inclusion}
        />
      </If>
      <If condition={relationType === RelationType.Inclusion && issueType === 'REQUIREMENT'}>
        <div className="p-2 bg-default-02">
          {list?.map((item) => (
            <IssueItem
              data={item}
              key={item.id}
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

      <If condition={relationType === RelationType.Connection}>
        <div className="p-2 bg-default-02">
          {list?.map((item) => (
            <IssueItem
              data={item}
              key={item.id}
              onClickIssue={(record) => {
                goTo(goTo.pages.issueDetail, {
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
    </>,
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
        <If condition={!!data?.length}>
          <span
            className="absolute left-[-20px] flex rounded-sm cursor-pointer text-sub hover:text-default hover:bg-default-06"
            onClick={() => setExpand(!expand)}
          >
            <ErdaIcon size={20} type={`${expand ? 'down-4ffff0f4' : 'right-4ffff0i4'}`} />
          </span>
        </If>
        <span className="text-base">{title}</span>
        <span className="bg-default-06 leading-4 rounded-lg px-1 ml-1">{data?.length || 0}</span>
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
  issueType,
  issueDetail,
  iterationID,
  setHasEdited,
}: {
  issueType: ISSUE_TYPE;
  issueDetail: ISSUE.IssueType;
  iterationID?: number;
  setHasEdited: (val: boolean) => void;
}) => {
  const [expand, setExpand] = React.useState(false);
  const data = getIssueRelation.useData();
  const _iterationID = iterationID === -1 ? undefined : iterationID; // 如果当前事项是待规划的，待规划不在迭代列表里，默认“全部”时其实还是会带上 -1 作为 id，所以为-1 时就传 undefined
  React.useEffect(() => {
    issueDetail?.id &&
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
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

  if (issueType !== ISSUE_TYPE.REQUIREMENT) return null;

  return (
    <>
      <IssueSection
        title={i18n.t('dop:Include')}
        expand={expand}
        setExpand={setExpand}
        data={data?.include}
        content={content}
        operations={operations}
      />
      <div className="h-[1px] bg-default-08 my-4" />
    </>
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

  const [relateMrOperation, relateMrContent, relateMrList] = useAddMrRelation({
    expand,
    issueDetail,
    afterAdd: () => getIssueStreams({ type: issueType, id: issueDetail?.id, pageNo: 1, pageSize: 100 }),
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
        issueId: issueDetail?.id,
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
}

export const AddIssueRelation = ({
  onSave,
  editAuth,
  projectId,
  iterationID,
  currentIssue,
  defaultIssueType = 'TASK',
  relationType,
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
    },
    iterationList: [] as ITERATION.Detail[],
  });

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

  const overlay = (
    <div className="w-[800px] shadow-card-lg bg-white">
      <div className="flex items-center justify-between px-4 py-3 font-medium">
        <span>{i18n.t('dop:choose issues')}</span>
        <ErdaIcon type="guanbi" size={20} className="hover-active" onClick={() => updater.visible(false)} />
      </div>
      <ContractiveFilter
        values={filterData}
        className="px-4 py-2"
        conditions={[
          {
            key: 'title',
            type: 'input',
            label: i18n.t('title'),
            fixed: true,
            showIndex: 1,
            placeholder: i18n.t('filter by {name}', { name: i18n.t('title') }),
          },
          {
            label: i18n.t('dop:owned iteration'),
            type: 'select',
            key: 'iterationID',
            haveFilter: true,
            fixed: true,
            emptyText: i18n.t('dop:all'),
            options: iterationList.map((item) => ({ label: item.title, value: item.id })) || [],
            showIndex: 2,
            placeholder: i18n.t('dop:owned iteration'),
            customProps: {
              mode: 'single',
            },
          },
          {
            label: i18n.t('dop:issue type'),
            type: 'select',
            key: 'type',
            options: map(ISSUE_OPTION, (item) => ISSUE_TYPE_MAP[item]),
            fixed: true,
            emptyText: i18n.t('dop:all'),
            showIndex: 3,
            disabled: relationType === RelationType.Inclusion,
            customProps: {
              mode: 'single',
            },
          },
        ]}
        onChange={(v) => {
          updater.filterData(v);
        }}
        delay={1000}
      />
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
}

const AddNewIssue = ({ onSaveRelation, iterationID, onCancel, defaultIssueType, typeDisabled }: IAddNewIssueProps) => {
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

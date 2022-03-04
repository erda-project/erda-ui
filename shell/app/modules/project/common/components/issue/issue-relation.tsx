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

import { Button, Dropdown, Empty } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { ContractiveFilter, ErdaIcon, Table as ErdaTable, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import { goTo } from 'common/utils';
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
import './issue-relation.scss';

export enum RelationType {
  Inclusion = 'inclusion',
  RelatedTo = 'related to',
  RelatedBy = 'related by',
}
type IDefaultIssueType = 'BUG' | 'TASK' | 'REQUIREMENT';

// 打开任务详情时，关联事项默认选中bug，打开缺陷详情或者需求详情时，关联事项默认选中task
// 如果是包含关系时，需求默认选中任务，任务默认选中需求
const initTypeMap = {
  [RelationType.RelatedTo]: {
    TASK: 'BUG',
    REQUIREMENT: 'TASK',
    BUG: 'TASK',
  },
  [RelationType.RelatedBy]: {
    TASK: 'BUG',
    REQUIREMENT: 'TASK',
    BUG: 'TASK',
  },
  [RelationType.Inclusion]: {
    TASK: 'REQUIREMENT',
    REQUIREMENT: 'TASK',
  },
};

const getAddTextMap = (relationType: RelationType, issueType: string) => {
  if (relationType === RelationType.RelatedTo) {
    return i18n.t('dop:related to these issues');
  } else if (relationType === RelationType.RelatedBy) {
    return i18n.t('dop:be related by these issues');
  } else if (relationType === RelationType.Inclusion) {
    if (issueType === ISSUE_TYPE.REQUIREMENT) {
      return i18n.t('dop:included tasks');
    }
  }
  return null;
};

interface IProps {
  list?: ISSUE.IssueType[];
  issueDetail: ISSUE.IssueType;
  iterationID: number | undefined;
  type: RelationType;
  onRelationChange?: () => void;
}

const IssueRelation = (props: IProps) => {
  const { list, issueDetail, iterationID, onRelationChange, type: relationType } = props;

  const [activeButtonType, setActiveButtonType] = React.useState('');
  const [expand, setExpand] = React.useState(true);

  const [{ projectId }, { type: routeIssueType }] = routeInfoStore.getState((s) => [s.params, s.query]);
  const issueType = issueDetail?.type || (Array.isArray(routeIssueType) ? routeIssueType[0] : routeIssueType);
  const defaultIssueType = initTypeMap[relationType][issueType];
  const { addIssueRelation, deleteIssueRelation } = issueStore.effects;

  const curIterationID = React.useMemo(() => {
    return issueDetail?.iterationID || iterationID;
  }, [issueDetail?.iterationID, iterationID]);

  const authObj = usePerm((s) => s.project.task);

  const updateRecord = (record: ISSUE.Task, key: string, val: any) => {
    issueStore.effects.updateIssue({ ...record, [key]: val }).finally(() => {
      getIssueRelation({ id: issueDetail.id, type: relationType });
    });
  };

  const addRelation = (idList: number[]) => {
    addIssueRelation({
      relatedIssues: idList,
      id: issueDetail.id,
      projectId: +projectId,
      // relatedTo and relatedBy is both 'connection'
      type: relationType === RelationType.Inclusion ? RelationType.Inclusion : 'connection',
    }).then(() => {
      onRelationChange && onRelationChange();
    });
  };

  const onDelete = (val: ISSUE.IssueType, beRelated = false) => {
    const payload = beRelated
      ? { id: val.id, relatedIssueID: issueDetail.id, type: 'connection' }
      : { id: issueDetail.id, relatedIssueID: val.id, type: 'connection' };
    deleteIssueRelation(payload).then(() => {
      onRelationChange && onRelationChange();
    });
  };
  const createAuth: boolean = usePerm((s) => s.project[issueType?.toLowerCase()]?.create.pass);
  if (!issueDetail) return null;
  const iconMap = {
    [RelationType.Inclusion]: 'baohan',
    [RelationType.RelatedTo]: 'guanlianqita',
    [RelationType.RelatedBy]: 'beiqitaguanlian',
  };
  return (
    <div className="issue-relation">
      <If condition={issueDetail.type !== ISSUE_TYPE.TICKET}>
        {/* <TransformToIssue issue={issue as ISSUE.Ticket} onSaveRelation={addRelation} /> */}
        <div className="relative flex items-center h-7 mb-2">
          <If condition={!!list?.length}>
            <span
              className="absolute left-[-20px] flex h-7 rounded-sm cursor-pointer text-desc hover:text-default hover:bg-default-06"
              onClick={() => setExpand((prev) => !prev)}
            >
              <ErdaIcon size={20} color={undefined} type={`${expand ? 'down-4ffff0f4' : 'right-4ffff0i4'}`} />
            </span>
          </If>
          <div className="flex-h-center text-default-6">
            <ErdaIcon size={16} className="mr-1" type={iconMap[relationType]} />
            <span>{getAddTextMap(relationType, issueType)}</span>
            <span className="bg-default-06 leading-4 rounded-lg px-1 ml-1">{list?.length}</span>
            <If condition={relationType !== RelationType.RelatedBy}>
              <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
              <WithAuth pass={createAuth}>
                <Button
                  size="small"
                  className="flex-h-center mr-2 font-medium"
                  onClick={() => setActiveButtonType('create')}
                >
                  <ErdaIcon type={'plus'} className="mr-1" />
                  <span>{i18n.t('create')}</span>
                </Button>
              </WithAuth>
              <AddIssueRelation
                editAuth={authObj.edit.pass}
                onSave={addRelation}
                onCancel={() => setActiveButtonType('')}
                projectId={projectId}
                iterationID={curIterationID}
                currentIssue={issueDetail}
                defaultIssueType={defaultIssueType}
                relationType={relationType}
              />
            </If>
          </div>
        </div>
        <If condition={activeButtonType === 'create'}>
          <AddNewIssue
            onSaveRelation={addRelation}
            onCancel={() => setActiveButtonType('')}
            iterationID={curIterationID}
            defaultIssueType={defaultIssueType}
            typeDisabled={relationType === RelationType.Inclusion}
          />
        </If>
      </If>
      <If condition={expand && !!list?.length}>
        <If condition={relationType === RelationType.Inclusion && issueType === 'REQUIREMENT'}>
          <div className="mt-2 p-2 bg-default-02">
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
                onDelete={(val) => onDelete(val)}
                deleteConfirmText={(name: string) => i18n.t('dop:Are you sure to disinclude {name}', { name })}
                deleteText={i18n.t('dop:release relationship')}
                issueType={BACKLOG_ISSUE_TYPE.undoneIssue}
                showStatus
                undraggable
              />
            ))}
          </div>
        </If>

        <If condition={relationType === RelationType.RelatedTo}>
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
                onDelete={(val) => onDelete(val)}
                // TODO:
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
        <If condition={relationType === RelationType.RelatedBy}>
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
                onDelete={(val) => onDelete(val, true)}
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
      </If>
    </div>
  );
};

export const FullIssueRelation = ({ issueType, issueDetail, iterationID, setHasEdited }) => {
  const data = getIssueRelation.useData();

  React.useEffect(() => {
    issueDetail?.id &&
      getIssueRelation.fetch({
        issueId: issueDetail.id,
      });
  }, [issueDetail?.id]);

  return (
    <>
      <If condition={issueType === ISSUE_TYPE.REQUIREMENT}>
        <IssueRelation
          type={RelationType.Inclusion}
          list={data?.include}
          issueDetail={issueDetail}
          iterationID={iterationID}
          // activeAdd={activeAdd}
          onRelationChange={() => {
            setHasEdited(true);
            getIssueRelation.fetch({
              issueId: issueDetail.id,
            });
          }}
        />
      </If>
      <IssueRelation
        type={RelationType.RelatedTo}
        list={data?.relatedTo}
        issueDetail={issueDetail}
        iterationID={iterationID}
        onRelationChange={() => {
          setHasEdited(true);
          getIssueRelation.fetch({
            issueId: issueDetail.id,
          });
        }}
      />
      <IssueRelation
        type={RelationType.RelatedBy}
        list={data?.relatedBy}
        issueDetail={issueDetail}
        iterationID={iterationID}
        onRelationChange={() => {
          setHasEdited(true);
          getIssueRelation.fetch({
            issueId: issueDetail.id,
          });
        }}
      />
    </>
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

const initState = {
  issueList: [],
  type: undefined as undefined | string,
  chosenIterationID: undefined as undefined | number | 'ALL',
};

export const AddIssueRelation = ({
  onSave,
  editAuth,
  projectId,
  iterationID,
  currentIssue,
  defaultIssueType = 'TASK',
  relationType,
}: IAddProps) => {
  const [{ filterData, visible }, updater, update] = useUpdate({
    ...initState,
    visible: false,
    filterData: {
      title: '',
      iterationID,
      type: defaultIssueType,
    },
  });

  const issuePaging = getIssues.useData();
  const iterationPaging = getProjectIterations.useData();
  const issueList = issuePaging?.list || [];
  const getIssueList = React.useCallback(
    (extra?: Obj) => {
      if (visible && projectId) {
        getIssues.fetch({
          pageNo: 1,
          pageSize: 7,
          ...filterData,
          ...extra,
          projectID: +projectId,
          notIncluded: relationType === RelationType.Inclusion,
        });
      }
    },
    [filterData, projectId, relationType, visible],
  );

  React.useEffect(() => {
    if (visible && !iterationPaging?.list.length) {
      getProjectIterations.fetch({
        projectID: +projectId,
        pageSize: 50,
      });
    }
  }, [iterationPaging?.list.length, projectId, visible]);

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
            options: iterationPaging?.list.map((item) => ({ label: item.title, value: item.id })) || [],
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
          current: issuePaging?.paging?.pageNo || 1,
          pageSize: issuePaging?.paging?.pageSize || 7,
          total: issuePaging?.paging?.total || 0,
          onChange: (no: number, size?: number) => {
            getIssueList({ pageNo: no, pageSize: size });
          },
        }}
      />
    </div>
  );

  return (
    <Dropdown overlay={overlay} visible={visible} trigger={['click']}>
      <WithAuth pass={editAuth}>
        <Button size="small" className="flex-h-center font-medium" onClick={() => updater.visible(true)}>
          <ErdaIcon type={'xuanze-43le7k0l'} className="mr-1" />
          <span>{i18n.t('common:select')}</span>
        </Button>
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

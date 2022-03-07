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
  const [expand, setExpand] = React.useState(false);

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
      setExpand(true);
    });
  };

  const onDelete = (val: ISSUE.IssueType, type: RelationType) => {
    const payload =
      type === RelationType.Inclusion
        ? { id: issueDetail.id, relatedIssueID: val.id, type }
        : type === RelationType.RelatedBy
        ? { id: val.id, relatedIssueID: issueDetail.id, type: 'connection' }
        : { id: issueDetail.id, relatedIssueID: val.id, type: 'connection' };
    deleteIssueRelation(payload).then(() => {
      onRelationChange && onRelationChange();
    });
  };
  const createAuth = usePerm((s) => s.project[issueType?.toLowerCase()]?.create.pass as boolean);
  if (!issueDetail) return null;
  return (
    <div className="issue-relation">
      <If condition={issueDetail.type !== ISSUE_TYPE.TICKET}>
        {/* <TransformToIssue issue={issue as ISSUE.Ticket} onSaveRelation={addRelation} /> */}
        <div className="relative flex items-center h-7 mb-2">
          <If condition={!!list?.length}>
            <span
              className="absolute left-[-20px] flex h-7 rounded-sm cursor-pointer text-sub hover:text-default hover:bg-default-06"
              onClick={() => setExpand((prev) => !prev)}
            >
              <ErdaIcon size={20} type={`${expand ? 'down-4ffff0f4' : 'right-4ffff0i4'}`} />
            </span>
          </If>
          <div className="flex-h-center text-primary font-medium">
            <span>{getAddTextMap(relationType, issueType)}</span>
            <span className="bg-default-06 leading-4 rounded-lg px-1 ml-1">{list?.length || 0}</span>
            <If condition={relationType !== RelationType.RelatedBy}>
              <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
              <WithAuth pass={createAuth}>
                <div
                  className="h-7 mr-1 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
                  onClick={() => setActiveButtonType('create')}
                >
                  <ErdaIcon type="plus" size={20} />
                </div>
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
                onDelete={(val) => onDelete(val, RelationType.RelatedTo)}
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
                onDelete={(val) => onDelete(val, RelationType.RelatedBy)}
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

export const FullIssueRelation = ({
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
  const data = getIssueRelation.useData();
  const _iterationID = iterationID === -1 ? undefined : iterationID; // 如果当前事项是待规划的，待规划不在迭代列表里，默认“全部”时其实还是会带上 -1 作为 id，所以为-1 时就传 undefined
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
          iterationID={_iterationID}
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
        iterationID={_iterationID}
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
        iterationID={_iterationID}
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
          <ErdaIcon type="xuanze-43le7k0l" size={20} />
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

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

import { MemberSelector, Title, ErdaIcon, Table as ErdaTable, ContractiveFilter, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Button, Select, Popconfirm, Tooltip, Empty, Dropdown } from 'antd';
import React, { useImperativeHandle } from 'react';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import issueStore from 'project/stores/issues';
import { useMount, useUpdateEffect } from 'react-use';
import { goTo } from 'common/utils';
import { debounce, map, filter, find } from 'lodash';
import iterationStore from 'project/stores/iteration';
import { Link } from 'react-router-dom';
import { getIssues as getIssuesService } from 'project/services/issue';
import { getIssueTypeOption, IssueIcon } from 'project/common/components/issue/issue-icon';
import {
  ISSUE_OPTION,
  ISSUE_TYPE,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
} from 'project/common/components/issue/issue-config';
import { WithAuth, usePerm, getAuth, isAssignee, isCreator } from 'user/common';
import moment from 'moment';
import { IssueItem, IssueForm, BACKLOG_ISSUE_TYPE } from 'project/pages/backlog/issue-item';
import './issue-relation.scss';
import IterationSelect from './iteration-select';
import IssueState from 'project/common/components/issue/issue-state';
import { ColumnProps } from 'antd/lib/table';
import { getProjectIterations } from 'project/services/project-iteration';

export enum RelationType {
  Inclusion = 'inclusion',
  RelatedTo = 'related to',
  RelatedBy = 'related by',
}
interface IProps {
  issueDetail: ISSUE.IssueType;
  iterationID: number | undefined;
  onRelationChange?: () => void;
  type: RelationType;
}
type IDefaultIssueType = 'BUG' | 'TASK' | 'REQUIREMENT';

const { Option } = Select;

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

export const IssueRelation = React.forwardRef((props: IProps, ref: any) => {
  const { issueDetail, iterationID, onRelationChange, type: relationType, activeButton } = props;

  const [relatingList, setRelatingList] = React.useState([] as ISSUE.IssueType[]);
  const [relatedList, setRelatedList] = React.useState([] as ISSUE.IssueType[]);
  const [activeButtonType, setActiveButtonType] = React.useState(activeButton || '');
  const addIssueRelationRef = React.useRef({});

  const [{ projectId }, { type: routeIssueType }] = routeInfoStore.getState((s) => [s.params, s.query]);
  const issueType = issueDetail?.type || (Array.isArray(routeIssueType) ? routeIssueType[0] : routeIssueType);
  const defaultIssueType = initTypeMap[relationType][issueType];
  const { getIssueRelation, addIssueRelation, deleteIssueRelation } = issueStore.effects;

  const getList = React.useCallback(() => {
    issueDetail?.id &&
      getIssueRelation({
        id: issueDetail.id,
        type: [RelationType.RelatedTo, RelationType.RelatedBy].includes(relationType) ? 'connection' : relationType,
      }).then((res) => {
        setRelatingList(res[0] || []);
        setRelatedList(res[1] || []);
      });
  }, [getIssueRelation, issueDetail, relationType]);

  useImperativeHandle(ref, () => ({ getList }), [getList]);

  const curIterationID = React.useMemo(() => {
    return issueDetail?.iterationID || iterationID;
  }, [issueDetail?.iterationID, iterationID]);

  React.useEffect(() => {
    getList();
  }, [getList]);

  const authObj = usePerm((s) => s.project.task);

  const updateRecord = (record: ISSUE.Task, key: string, val: any) => {
    issueStore.effects.updateIssue({ ...record, [key]: val }).finally(() => {
      getIssueRelation({ id: issueDetail.id, type: relationType });
    });
  };
  const getColumns = (beRelated = false): Array<ColumnProps<ISSUE.IssueType>> => [
    {
      title: i18n.t('{name} title', { name: i18n.t('dop:issue') }),
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
      render: (v: number, record: any) => {
        const currentState = find(record?.issueButton, (item) => item.stateID === v);
        return currentState ? <IssueState stateID={currentState.stateID} /> : undefined;
      },
    },
    {
      title: i18n.t('dop:assignee'),
      dataIndex: 'assignee',
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
      title: i18n.t('dop:planFinishedAt'),
      dataIndex: 'planFinishedAt',
      width: 176,
      render: (v: string) => moment(v).format('YYYY/MM/DD HH:mm:ss'),
    },
    {
      title: null,
      dataIndex: 'operate',
      render: (_, record: ISSUE.IssueType) => {
        return [
          <WithAuth pass={authObj.edit.pass} key="remove-relation">
            <Popconfirm
              title={`${i18n.t('confirm remove relation?')}`}
              placement="bottom"
              onConfirm={() => onDelete(record, beRelated)}
            >
              <span className="fake-link">{i18n.t('dop:disassociate')}</span>
            </Popconfirm>
          </WithAuth>,
        ];
      },
      width: authObj.edit.pass ? 80 : 0,
    },
  ];

  const addRelation = (val: number) => {
    addIssueRelation({ relatedIssues: val, id: issueDetail.id, projectId: +projectId, type: relationType }).then(() => {
      onRelationChange && onRelationChange();
      getList();
      addIssueRelationRef.current.getIssueList?.();
    });
  };

  const onDelete = (val: ISSUE.IssueType, beRelated = false) => {
    const payload = beRelated
      ? { id: val.id, relatedIssueID: issueDetail.id, type: relationType }
      : { id: issueDetail.id, relatedIssueID: val.id, type: relationType };
    deleteIssueRelation(payload).then(() => {
      onRelationChange && onRelationChange();
      getList();
      addIssueRelationRef.current.getIssueList?.();
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
        <div>
          <div className="flex-h-center text-default-6 mb-2">
            <ErdaIcon className="mr-1" type={iconMap[relationType]} />
            <span>{getAddTextMap(relationType, issueType)}</span>
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
                ref={addIssueRelationRef}
                editAuth={authObj.edit.pass}
                onSave={addRelation}
                onCancel={() => setActiveButtonType('')}
                projectId={projectId}
                iterationID={curIterationID}
                currentIssue={issueDetail}
                defaultIssueType={defaultIssueType}
                typeDisabled={relationType === RelationType.Inclusion}
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
      <If condition={relationType === RelationType.Inclusion}>
        <div className="mt-2 p-2 bg-default-02">
          {relatingList?.map((item) => (
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
          )) || <Empty />}
        </div>
      </If>

      <If condition={relationType === RelationType.RelatedTo}>
        <div className="p-2 bg-default-02">
          {relatingList?.map((item) => (
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
          )) || <Empty />}
        </div>
      </If>
      <If condition={relationType === RelationType.RelatedBy}>
        <div className="p-2 bg-default-02">
          {relatedList?.map((item) => (
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
              issueType={BACKLOG_ISSUE_TYPE.undoneIssue}
              showStatus
              undraggable
            />
          )) || <Empty />}
        </div>
      </If>
    </div>
  );
});

interface IAddProps {
  editAuth: boolean;
  projectId: string;
  currentIssue?: ISSUE.IssueType;
  iterationID?: number | undefined;
  defaultIssueType?: IDefaultIssueType;
  onSave: (v: number) => void;
  onCancel: () => void;
  typeDisabled?: boolean;
  relationType: RelationType;
  hideCancelButton?: boolean;
}

const initState = {
  issueList: [],
  type: undefined as undefined | string,
  chosenIterationID: undefined as undefined | number | 'ALL',
};

export const AddIssueRelation = React.forwardRef(
  (
    {
      onSave,
      editAuth,
      projectId,
      iterationID,
      currentIssue,
      onCancel,
      defaultIssueType = 'TASK',
      typeDisabled = false,
      hideCancelButton = false,
      relationType,
    }: IAddProps,
    ref,
  ) => {
    const [{ filterData, visible }, updater, update] = useUpdate({
      ...initState,
      visible: false,
      filterData: {
        title: '',
        iterationID,
        type: defaultIssueType,
      },
    });

    const [issuePaging, loadingIssueList] = getIssuesService.useState();
    const iterationPaging = getProjectIterations.useData();
    const issueList = issuePaging?.list || [];
    const getIssueList = React.useCallback(() => {
      getIssuesService.fetch({
        ...filterData,
        projectID: +projectId,
        pageSize: 50,
        pageNo: 1,
        notIncluded: relationType === RelationType.Inclusion,
      });
    }, [filterData, projectId, relationType]);
    React.useEffect(() => {
      if (visible && !iterationPaging?.list.length) {
        getProjectIterations.fetch({
          projectID: +projectId,
          pageSize: 50,
        });
      }
    }, [iterationPaging?.list.length, projectId, visible]);

    React.useImperativeHandle(ref, () => ({
      getIssueList,
    }));

    // const onClose = () => {
    //   update({
    //     type: defaultIssueType,
    //     iterationID: undefined,
    //     issueList: [],
    //   });
    //   onCancel();
    // };

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
        render: (item: string) => moment(item).format('YYYY/MM/DD') || i18n.t('unspecified'),
      },
    ];

    const overlay = (
      <div className="w-[800px] shadow-card-lg bg-white">
        <div className="flex items-center justify-between px-4 py-3 bg-default-02 font-medium">
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
              options: map(ISSUE_OPTION, (item) => {
                const iconObj = ISSUE_TYPE_MAP[item];
                const { value } = iconObj;
                return {
                  label: value,
                  value,
                  icon: item,
                };
              }),
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
          // loading={loadingIssueList}
          rowSelection={{
            actions: [
              {
                key: 'batchSelect',
                name: i18n.t('choose'),
                onClick: (keys) => {
                  onSave(keys[0] as number);
                  updater.visible(false);
                },
                isVisible: (keys) => keys.length > 0,
              },
            ],
          }}
          dataSource={issueList.filter((item) => item.id !== currentIssue?.id) || []}
          columns={columns}
          pagination={{
            pageSize: 7,
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
  },
);

interface IAddNewIssueProps {
  iterationID: number | undefined;
  defaultIssueType: IDefaultIssueType;
  onSaveRelation: (v: number) => void;
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
        }).then((res: number) => {
          onSaveRelation(res); // 添加关联
          return res;
        });
      }}
      typeDisabled={typeDisabled}
    />
  );
};

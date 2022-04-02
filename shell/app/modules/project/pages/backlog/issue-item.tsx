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

/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Dropdown, Input, Menu, Modal, Select } from 'antd';
import { useUpdate } from 'app/common/use-hooks';
import orgStore from 'app/org-home/stores/org';
import { Ellipsis, Icon as CustomIcon, MemberSelector } from 'common';
import UserInfo from 'common/components/user-info';
import { getBrowserInfo, isPromise } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import { map, compact } from 'lodash';
import moment from 'moment';
import issueFieldStore from 'org/stores/issue-field';
import { ISSUE_OPTION } from 'project/common/components/issue/issue-config';
import { getIssueTypeOption, IssueIcon } from 'project/common/components/issue/issue-icon';
import IssueState from 'project/common/components/issue/issue-state';
import { ISSUE_TYPE, templateMap } from 'project/common/issue-config';
import { getFieldsByIssue } from 'project/services/issue';
import issueWorkflowStore from 'project/stores/issue-workflow';
import issueStore from 'project/stores/issues';
import React from 'react';
import { useDrag } from 'react-dnd';
import { getAuth, isAssignee, isCreator, usePerm, WithAuth } from 'user/common';
import userStore from 'user/stores';
import { FieldSelector, memberSelectorValueItem } from 'project/pages/issue/component/table-view';
import iterationStore from 'app/modules/project/stores/iteration';
import './issue-item.scss';

export enum BACKLOG_ISSUE_TYPE {
  iterationIssue = 'iterationIssue',
  undoneIssue = 'undoneIssue',
}

const { isWin } = getBrowserInfo();

interface IIssueProps {
  data: ISSUE.Issue;
  editable?: boolean;
  issueType: BACKLOG_ISSUE_TYPE;
  onClickIssue?: (data: ISSUE.Issue) => void;
  onDragDelete?: () => void;
  onDelete?: (data: ISSUE.Issue) => void;
  deleteConfirmText?: string | React.ReactNode | ((name: string) => string | React.ReactNode);
  deleteText: string | React.ReactNode;
  undraggable?: boolean;
  showStatus?: boolean;
  showIteration?: boolean;
  afterUpdate?: () => void;
}

const noop = () => Promise.resolve();
export const IssueItem = (props: IIssueProps) => {
  const {
    data,
    onDelete,
    afterUpdate,
    onDragDelete,
    issueType,
    onClickIssue = noop,
    deleteText,
    deleteConfirmText,
    undraggable = false,
    showStatus = false,
    showIteration = false,
    editable = false,
  } = props;
  const workflowStateList = issueWorkflowStore.useStore((s) => s.workflowStateList);
  const { title, type, priority, creator, assignee, id, iterationID, issueButton } = data;
  const iterationList = iterationStore.useStore((s) => s.iterationList);
  const projectPerm = usePerm((s) => s.project);
  const { projectId } = routeInfoStore.getState((s) => s.params);
  const permObj =
    type === ISSUE_OPTION.REQUIREMENT
      ? projectPerm.requirement
      : type === ISSUE_OPTION.TASK
      ? projectPerm.task
      : projectPerm.bug;
  const checkRole = [isCreator(creator), isAssignee(assignee)];
  const deleteAuth = getAuth(permObj.delete, checkRole);
  const editAuth = getAuth(permObj.edit, checkRole);

  const { updateIssue } = issueStore.effects;

  const updateIssueRecord = (val: ISSUE.Ticket) => {
    updateIssue(val).then(() => {
      afterUpdate?.();
    });
  };

  const [_, drag] = useDrag({
    item: { type: issueType, data },
    canDrag: () => {
      return editAuth && !undraggable; // 拖拽权限等同修改权限
    },
    end: (__, monitor) => {
      const dropRes = monitor.getDropResult();
      // 获取drop中返回的promsie，确保修改事项结束后在拉取新的列表
      if (dropRes && dropRes.res && isPromise(dropRes.res)) {
        dropRes.res.then(() => {
          onDragDelete?.();
        });
      }
    },
  });
  const name = `${title}`;

  const confirmDelete = (currentData: ISSUE.Issue) => {
    Modal.confirm({
      title: deleteConfirmText
        ? typeof deleteConfirmText === 'function'
          ? deleteConfirmText(name)
          : deleteConfirmText
        : `${i18n.t('common:confirm deletion')}(${name})`,
      onOk() {
        onDelete && onDelete(currentData);
      },
    });
  };

  const state = workflowStateList.find((item) => item.stateID === data.state);

  const statusOptions: Array<{ value: string; iconLabel: JSX.Element; disabled: boolean }> = [];
  map(issueButton, (item) => {
    statusOptions.push({
      disabled: !item.permission,
      value: `${item.stateID}`,
      iconLabel: <IssueState stateID={item.stateID} />,
    });
  });

  const fieldsMap = {
    iteration: {
      Comp: (
        <div className="w-20 mr-2 truncate">
          {iterationID === -1 ? i18n.t('dop:Backlog') : iterationList?.find((item) => item.id === iterationID)?.title}
        </div>
      ),
      show: showIteration,
    },
    status: {
      Comp: state ? (
        editable ? (
          <FieldSelector
            field="state"
            className="w-24 mr-6"
            hasAuth={editAuth}
            value={`${state.stateID}`}
            record={data}
            updateRecord={(_val: string) => {
              updateIssueRecord({ ...data, state: +_val });
            }}
            options={statusOptions}
          />
        ) : (
          <div key="state" className="mr-6 w-24">
            <IssueState stateID={state.stateID} />
          </div>
        )
      ) : null,
      show: showStatus,
    },
    assignee: {
      Comp: editable ? (
        <WithAuth pass={editAuth}>
          <MemberSelector
            scopeType="project"
            scopeId={projectId}
            dropdownMatchSelectWidth={false}
            valueItemRender={memberSelectorValueItem}
            className="issue-item-member-selector w-28 mr-6"
            allowClear={false}
            disabled={!editAuth}
            value={assignee}
            onChange={(val) => {
              updateIssueRecord({ ...data, assignee: val as string });
            }}
          />
        </WithAuth>
      ) : (
        <UserInfo.RenderWithAvatar key="assignee" id={data.assignee} className="w-28 mr-6" />
      ),
      show: true,
    },
    planFinishedAt: {
      Comp: (
        <span key="planFinishedAt" className="mr-6 w-20 truncate">
          {data.planFinishedAt ? moment(data.planFinishedAt).format('YYYY/MM/DD') : i18n.t('dop:unspecified')}
        </span>
      ),
      show: true,
    },
    operation: {
      Comp: onDelete ? (
        <span key="operation" className="w-6" onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={['click']}
            overlayClassName="contractive-filter-item-dropdown"
            overlay={
              <Menu
                onClick={({ key }) => {
                  if (key === 'delete') {
                    confirmDelete(data);
                  }
                }}
              >
                <Menu.Item
                  key="delete"
                  disabled={!deleteAuth}
                  className={`text-danger ${deleteAuth ? '' : 'disabled'}`}
                >
                  {deleteText || i18n.t('delete')}
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft"
          >
            <span className="op-icon" onClick={(e) => e.stopPropagation()}>
              <CustomIcon className="hover-active" type="gd" />
            </span>
          </Dropdown>
        </span>
      ) : null,
      show: true,
    },
  };

  const fields = compact(map(fieldsMap, (item) => (item.show ? item.Comp : null)));
  return (
    <div
      className={`backlog-issue-item hover:bg-default-04 cursor-pointer ${
        !undraggable && editAuth ? 'draggable' : 'cursor-default'
      }`}
      ref={drag}
    >
      <div className="issue-info h-full">
        <div className="backlog-item-content mr-6" onClick={() => onClickIssue(data)}>
          <IssueIcon type={type as ISSUE_TYPE} size={28} />
          <span className="mr-1">#{id}-</span>
          <Ellipsis title={name} />
        </div>
        <div className="text-sub flex items-center flex-wrap justify-end">{fields}</div>
      </div>
    </div>
  );
};

interface IIssueFormProps {
  className?: string;
  defaultIssueType?: 'TASK' | 'REQUIREMENT' | 'BUG';
  onCancel: () => void;
  onOk: (data: ISSUE.BacklogIssueCreateBody) => Promise<number>;
  typeDisabled?: boolean;
}

const placeholderMap = {
  REQUIREMENT: i18n.t('input {name} title', { name: i18n.t('requirement') }),
  TASK: i18n.t('input {name} title', { name: i18n.t('task') }),
  BUG: i18n.t('input {name} title', { name: i18n.t('Bug') }),
};

export const IssueForm = (props: IIssueFormProps) => {
  const { onCancel = noop, onOk, className = '', defaultIssueType, typeDisabled } = props;
  const { projectId } = routeInfoStore.getState((s) => s.params);
  const { addFieldsToIssue } = issueStore.effects;
  const [bugStageList, taskTypeList] = issueFieldStore.useStore((s) => [s.bugStageList, s.taskTypeList]);
  const orgID = orgStore.useStore((s) => s.currentOrg.id);
  const loginUser = userStore.getState((s) => s.loginUser);

  const [formData, updater] = useUpdate({
    title: '',
    type: defaultIssueType || ISSUE_OPTION.REQUIREMENT,
    assignee: loginUser.id,
  });

  const onAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const continueAdd = isWin ? e.shiftKey : e.metaKey;
    const data = {
      ...formData,
      content: templateMap[formData.type] || '',
      // some special fields for different type
      taskType: taskTypeList?.length ? taskTypeList[0].value : '',
      bugStage: bugStageList?.length ? bugStageList[0].value : '',
      owner: '',
    };
    onOk?.(data).then((newIssueID) => {
      getFieldsByIssue({
        issueID: newIssueID,
        orgID,
        propertyIssueType: data.type as ISSUE_FIELD.IIssueType,
      }).then((res) => {
        const fieldList = res.data?.property;
        if (fieldList) {
          const property = map(fieldList, (item) => {
            if (item && item.required) {
              if (['Select', 'MultiSelect'].includes(item.propertyType)) {
                return {
                  ...item,
                  values: [item.enumeratedValues?.[0].id as number],
                };
              }
            }
            return { ...item };
          });
          addFieldsToIssue({ property, issueID: newIssueID, orgID, projectID: +projectId });
        }
      });
      updater.title('');
      if (!continueAdd) {
        onCancel();
      }
    });
  };

  return (
    <div className={`${className} relative flex justify-between items-center`}>
      <Input
        key={className} // for keep autoFocus
        value={formData.title}
        placeholder={`${placeholderMap[formData.type]}, ${i18n.t(
          'Enter to save quickly, {meta} + Enter to save and continue',
          { meta: isWin ? 'Shift' : 'Cmd' },
        )}`}
        maxLength={255}
        onPressEnter={onAdd}
        autoFocus
        onChange={(e) => updater.title(e.target.value)}
        style={{ height: '42px', paddingRight: '180px', paddingLeft: '90px' }}
      />
      <Select
        disabled={typeDisabled}
        value={formData.type as ISSUE_OPTION}
        bordered={false}
        onChange={(v: ISSUE_OPTION) => updater.type(v)}
        className="absolute"
        optionLabelProp="data-icon"
        dropdownMatchSelectWidth={false}
      >
        {getIssueTypeOption()}
      </Select>
      <div className="absolute right-2 flex items-center space-x-2">
        <MemberSelector
          dropdownMatchSelectWidth={false}
          scopeType="project"
          scopeId={String(projectId)}
          allowClear={false}
          bordered={false}
          value={loginUser.id}
          onChange={(v) => updater.assignee(v)}
        />
        <Button type="primary" size="small" onClick={onAdd} className="h-6 leading-4" disabled={!formData.title}>
          {i18n.t('Save')}
        </Button>
        <Button size="small" onClick={onCancel} className="h-6 leading-4">
          {i18n.t('Cancel')}
        </Button>
      </div>
    </div>
  );
};

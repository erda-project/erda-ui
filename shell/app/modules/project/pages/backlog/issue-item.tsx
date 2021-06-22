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
import * as React from 'react';
import { ISSUE_PRIORITY_MAP, ISSUE_OPTION } from 'project/common/components/issue/issue-config';
import { Icon as CustomIcon, MemberSelector, Avatar } from 'common';
import { useDrag } from 'react-dnd';
import { WithAuth, usePerm, isAssignee, isCreator, getAuth } from 'user/common';
import { isPromise } from 'common/utils';
import { get } from 'lodash';
import i18n from 'i18n';
import { IssueIcon, getIssueTypeOption } from 'project/common/components/issue/issue-icon';
import { Ellipsis, Menu, Dropdown, Modal } from 'app/nusi';
import { Form } from 'dop/pages/form-editor/index';
import './issue-item.scss';
import routeInfoStore from 'app/common/stores/route';
import userStore from 'app/user/stores';
import userMapStore from 'app/common/stores/user-map';

export enum BACKLOG_ISSUE_TYPE {
  iterationIssue = 'iterationIssue',
  undoneIssue = 'undoneIssue',
}

interface IIssueProps {
  data: ISSUE.Issue;
  issueType: BACKLOG_ISSUE_TYPE;
  onClickIssue: (data: ISSUE.Issue) => void;
  onDragDelete: () => void;
  onDelete?: (data: ISSUE.Issue) => void;
}

const noop = () => Promise.resolve();
export const IssueItem = (props: IIssueProps) => {
  const { data, onDelete, onDragDelete, issueType, onClickIssue = noop } = props;
  const { title, type, priority, creator, assignee } = data;
  const curPriority = ISSUE_PRIORITY_MAP[priority] || {};
  const userMap = userMapStore.useStore((s) => s);
  const projectPerm = usePerm((s) => s.project);
  const permObj =
    type === ISSUE_OPTION.REQUIREMENT
      ? projectPerm.requirement
      : type === ISSUE_OPTION.TASK
      ? projectPerm.task
      : projectPerm.bug;
  const checkRole = [isCreator(creator), isAssignee(assignee)];
  const deleteAuth = getAuth(permObj.delete, checkRole);
  const editAuth = getAuth(permObj.edit, checkRole);

  const [_, drag] = useDrag({
    item: { type: issueType, data },
    canDrag: () => {
      return editAuth; // 拖拽权限等同修改权限
    },
    end: (__, monitor) => {
      const dropRes = monitor.getDropResult();
      // 获取drop中返回的promsie，确保修改事项结束后在拉取新的列表
      if (dropRes && dropRes.res && isPromise(dropRes.res)) {
        dropRes.res.then(() => {
          onDragDelete();
        });
      }
    },
  });
  const name = `${title}`;
  const user = get(userMap, data.assignee, {});
  const username = user.nick || user.name;

  const confirmDelete = (currentData: any) => {
    Modal.confirm({
      title: `${i18n.t('common:confirm deletion')}(${name})`,
      onOk() {
        onDelete && onDelete(currentData);
      },
    });
  };

  return (
    <div
      className={`backlog-issue-item hover-active-bg ${editAuth ? 'draggable' : ''}`}
      ref={drag}
      onClick={() => onClickIssue(data)}
    >
      <div className="issue-info h-full">
        <div className="backlog-item-content">
          <IssueIcon type={type as ISSUE_OPTION} />
          <Ellipsis className="bold" title={name} />
        </div>
        <div className="backlog-item-info color-text-sub right-flex-box">
          <div className="backlog-item-priority mw-60">{curPriority.iconLabel}</div>
          <div className="w-80">
            <Avatar showName name={username} size={20} wrapClassName="w-full" />
          </div>
          {onDelete ? (
            <div>
              <Dropdown
                trigger={['click']}
                overlayClassName="contractive-filter-item-dropdown"
                overlay={
                  <Menu>
                    <WithAuth pass={deleteAuth}>
                      <Menu.Item
                        className="color-danger"
                        onClick={(e) => {
                          e.domEvent.stopPropagation();
                          confirmDelete(data);
                        }}
                      >
                        {i18n.t('delete')}
                      </Menu.Item>
                    </WithAuth>
                  </Menu>
                }
                placement="bottomLeft"
              >
                <span className="op-icon" onClick={(e) => e.stopPropagation()}>
                  <CustomIcon className="hover-active" type="gd" />
                </span>
              </Dropdown>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface IIssueFormProps {
  className?: string;
  defaultIssueType?: 'TASK' | 'REQUIREMENT' | 'BUG';
  onCancel: () => void;
  onOk: (data: ISSUE.BacklogIssueCreateBody) => Promise<any>;
}

const placeholderMap = {
  REQUIREMENT: i18n.t('{name} title', { name: i18n.t('project:requirement') }),
  TASK: i18n.t('{name} title', { name: i18n.t('project:task') }),
  BUG: i18n.t('{name} title', { name: i18n.t('project:bug') }),
};
export const IssueForm = (props: IIssueFormProps) => {
  const { onCancel = noop, onOk = noop, className = '', defaultIssueType } = props;
  const [chosenType, setChosenType] = React.useState(defaultIssueType || ISSUE_OPTION.REQUIREMENT);
  const formRef = React.useRef(null as any);
  const { projectId } = routeInfoStore.getState((s) => s.params);

  const onAdd = () => {
    const curForm = formRef && formRef.current;
    if (curForm) {
      curForm.onSubmit((val: ISSUE.BacklogIssueCreateBody) => {
        onOk(val).then(() => curForm.reset('title'));
      });
    }
  };

  const fields = [
    {
      label: '',
      component: 'select',
      key: 'type',
      required: true,
      initialValue: chosenType,
      componentProps: {
        size: 'small',
        className: 'backlog-issue-add-type',
        optionLabelProp: 'data-icon',
        dropdownMatchSelectWidth: false,
        style: { width: 50 },
        onChange: (val: ISSUE_OPTION) => {
          setChosenType(val);
        },
      },
      dataSource: {
        type: 'static',
        static: () => getIssueTypeOption(),
      },
      type: 'select',
    },
    {
      label: '',
      component: 'input',
      key: 'title',
      required: true,
      wrapperProps: {
        className: 'backlog-issue-add-title-box',
      },
      componentProps: {
        placeholder: `${placeholderMap[chosenType]}, ${i18n.t('enter key to save quickly')}`,
        maxLength: 255,
        size: 'small',
        autoFocus: true,
        className: 'backlog-issue-add-title',
        onPressEnter: onAdd,
      },
      type: 'input',
      requiredCheck: (v: string) => [v !== undefined && v !== '', ''],
    },
    {
      label: '',
      name: 'assignee',
      key: 'assignee',
      type: 'custom',
      componentProps: {
        size: 'small',
        className: 'mt4 backlog-issue-add-assignee',
      },
      initialValue: userStore.getState((s) => s.loginUser.id),
      getComp: () => {
        return <MemberSelector scopeType="project" scopeId={String(projectId)} allowClear={false} size="small" />;
      },
    },
  ];

  React.useEffect(() => {
    const curForm = formRef && formRef.current;
    if (curForm) {
      curForm.setFields(fields);
    }
  }, [chosenType]);

  return (
    <div className={`${className} backlog-issue-form flex-box`}>
      <div className={'backlog-issue-form-box h-full'}>
        <Form fields={fields} formRef={formRef} formProps={{ layout: 'inline', className: 'backlog-issue-add' }} />
      </div>
      <div className="table-operations ml8">
        <span className="table-operations-btn" onClick={onAdd}>
          {i18n.t('save')}
        </span>
        <span className="table-operations-btn" onClick={onCancel}>
          {i18n.t('cancel')}
        </span>
      </div>
    </div>
  );
};

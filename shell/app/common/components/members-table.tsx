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

import { MemberScope } from 'app/common/stores/_member';
import { usePerm } from 'app/user/common';
import userStore from 'app/user/stores';
import appMemberStore from 'common/stores/application-member';
import { AddMemberModal, Copy, FilterGroup, FormModal, IF, DropdownSelect } from 'common';
import { useLoading } from 'common/stores/loading';
import { AuthorizeMemberModal } from './authorize-member-modal';
import i18n from 'i18n';
import { debounce, map, isEmpty, find, isArray, filter, get } from 'lodash';
import { Button, Modal, Select, Spin, Table, Tooltip, message } from 'app/nusi';
import orgMemberStore from 'common/stores/org-member';
import projectMemberStore from 'common/stores/project-member';
import * as React from 'react';
import { useEffectOnce } from 'react-use';
import { UrlInviteModal } from './url-invite-modal';
import { BatchAuthorizeMemberModal } from './batch-authorize-member-modal';
import { insertWhen, goTo } from '../utils';
import { useUpdate } from './use-hooks';
import routeInfoStore from '../stores/route';
import memberLabelStore from 'common/stores/member-label';
import orgStore from 'app/org-home/stores/org';
import './members-table.scss';

const storeMap = {
  [MemberScope.ORG]: orgMemberStore,
  [MemberScope.PROJECT]: projectMemberStore,
  [MemberScope.APP]: appMemberStore,
};

enum batchOptionType {
  edit = 'edit',
  remove = 'remove',
  authorize = 'authorize',
}

const { Option } = Select;

interface IProps {
  scopeKey: MemberScope;
  readOnly?: boolean;
  showAuthorize?: boolean;
  hideBatchOps?: boolean;
  overwriteAuth?: {
    add?: boolean
    edit?: boolean
    delete?: boolean
    showAuthorize?: boolean
  };
}

export const MembersTable = ({
  scopeKey,
  readOnly = false,
  showAuthorize = false,
  hideBatchOps = false,
  overwriteAuth = {},
}: IProps) => {
  const memberLabels = memberLabelStore.useStore(s => s.memberLabels);
  const { getMemberLabels } = memberLabelStore.effects;
  const loginUser = userStore.useStore(s => s.loginUser);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { id: orgId, name: orgName, displayName: orgDisplayName } = currentOrg;
  
  const [projectMemberPerm, appMemberPerm] = usePerm(s => [s.project.member, s.app.member]);
  const { id: currentUserId } = loginUser;
  const { params } = routeInfoStore.getState(s => s);

  const memberStore = storeMap[scopeKey];
  const [list, paging, roleMap] = memberStore.useStore(s => [s.list, s.paging, s.roleMap]);
  const { cleanMembers } = memberStore.reducers;
  const { getMemberList, updateMembers, removeMember, getRoleMap, genOrgInviteCode } = memberStore.effects;

  const [getLoading, removeLoading, addLoading, updateLoading, getInviteLoading] = useLoading(memberStore, ['getMemberList', 'removeMember', 'addMembers', 'updateMembers', 'genOrgInviteCode']);

  const [state, updater] = useUpdate({
    addModalVisible: false,
    batchEditVisible: false,
    inviteModalVisible: false,
    batchAuthorizeVisible: false,
    verifyCode: undefined,
    selectedKeys: [],
    authorizeMember: null,
    editMember: null,
    queryParams: {},
  });

  const scopeIdMap = {
    [MemberScope.ORG]: String(orgId),
    [MemberScope.PROJECT]: `${params.projectId}`,
    [MemberScope.APP]: `${params.appId}`,
  };

  const scopeId = scopeIdMap[scopeKey];
  const scope = React.useMemo(() => ({ id: scopeId, type: scopeKey }), [scopeId, scopeKey]);

  const memberAuthMap = {
    [MemberScope.PROJECT]: {
      add: projectMemberPerm.addProjectMember.pass,
      edit: projectMemberPerm.editProjectMember.pass,
      delete: projectMemberPerm.removeProjectMember.pass,
      showAuthorize: projectMemberPerm.showAuthorize.pass,
      invite: false,
    },
    [MemberScope.ORG]: { add: true, edit: true, delete: true, showAuthorize: false, batch: true, invite: true },
    [MemberScope.APP]: {
      add: appMemberPerm.addAppMember.pass,
      edit: appMemberPerm.editAppMember.pass,
      delete: appMemberPerm.deleteAppMember.pass,
      showAuthorize: false, // 应用级别无授权
      invite: false,
    },
  };
  const memberAuth = { ...memberAuthMap[scopeKey], ...overwriteAuth };

  const batchOptions = [
    { key: batchOptionType.edit, name: i18n.t('edit'), disabled: !memberAuth.edit },
    ...insertWhen(showAuthorize && memberAuth.showAuthorize, [
      { key: batchOptionType.authorize, name: i18n.t('authorize') },
    ]),
    { key: batchOptionType.remove, name: i18n.t('remove'), disabled: !memberAuth.delete || isEmpty(filter(state.selectedKeys, item => item !== currentUserId)) },
  ];

  useEffectOnce(() => {
    getRoleMap({ scopeType: scopeKey, scopeId: +scopeId });
    if (scope.type === MemberScope.ORG) {
      getMemberLabels();
    }
    return () => {
      cleanMembers();
    };
  });

  React.useEffect(() => {
    if (scope.id) {
      getMemberList({ scope, ...state.queryParams } as MEMBER.GetListQuery);
    }
  }, [getMemberList, scope, state.queryParams]);

  const onTableSelectChange = React.useCallback((keys: Array<number | string>) => {
    updater.selectedKeys(keys);
  }, [updater]);

  const onBatchClick = ({ key }: any) => {
    switch (key) {
      case batchOptionType.edit:
        updater.batchEditVisible(true);
        break;
      case batchOptionType.remove:
        confirmDelete(filter(state.selectedKeys, item => item !== currentUserId));
        break;
      case batchOptionType.authorize:
        updater.batchAuthorizeVisible(true);
        break;
      default:
        break;
    }
  };

  const handleGenOrgInviteCode = () => {
    genOrgInviteCode().then(result => {
      const verifyCode = get(result, 'verifyCode');
      if (verifyCode) {
        updater.verifyCode(verifyCode as any);
        updater.inviteModalVisible(true);
      } else {
        message.error(i18n.t('org:cannot generate invitation code temporarily'));
      }
    });
  };

  const onSearchMembers = React.useCallback(({ query, queryRole, label }: { query: string; queryRole: string, label: string[] }) => {
    updater.queryParams({ ...state.queryParams, q: query, roles: [queryRole], pageNo: 1, label });
  }, [state.queryParams, updater]);

  const handleCloseEditModal = React.useCallback(() => {
    updater.editMember(null);
    updater.batchEditVisible(false);
  }, [updater]);

  const updateRole = React.useCallback((data: { roles: string[] }) => {
    let userIds = [];
    if (state.batchEditVisible) {
      userIds = state.selectedKeys;
    } else {
      const { userId } = state.editMember as IMember;
      userIds = [userId];
    }
    updateMembers({ userIds, scope, ...data }, { isSelf: userIds.includes(currentUserId), queryParams: state.queryParams });
    handleCloseEditModal();
  }, [handleCloseEditModal, currentUserId, scope, state.batchEditVisible, state.editMember, state.queryParams, state.selectedKeys, updateMembers]);

  const handleBatchAuthorize = ({ applications, roles }: { applications: number[], roles: string[] }) => {
    updateMembers({
      scope: { id: params.projectId, type: MemberScope.PROJECT },
      userIds: state.selectedKeys,
      roles,
      targetScopeType: MemberScope.APP,
      targetScopeIds: applications,
    });
    updater.batchAuthorizeVisible(false);
  };

  const fieldsList = React.useMemo(() => {
    return [
      {
        label: i18n.t('role'),
        name: 'roles',
        type: 'select',
        itemProps: {
          mode: 'multiple',
        },
        options: () => {
          return map(roleMap, (name, value) => (
            <Option key={value} value={value}>
              {name}
            </Option>
          ));
        },
      },
      ...insertWhen(scope.type === MemberScope.ORG && !isEmpty(memberLabels), [{
        label: i18n.t('member label'),
        name: 'labels',
        type: 'select',
        required: false,
        itemProps: {
          mode: 'multiple',
          placeholder: i18n.t('select member label'),
        },
        options: map(memberLabels, (item) => ({ name: item.name, value: item.label })),
      }]),
    ];
  }, [memberLabels, roleMap, scope.type]);

  const confirmDelete = React.useCallback((user: IMember | string[], isSelf?: boolean) => {
    let title = '' as any;
    let userIds = [] as string[];
    if (isArray(user)) {
      title = i18n.t('common:confirm batch remove user');
      userIds = user;
    } else {
      title = isSelf
        ? `{name}, ${i18n.t('common:are you confirm to quit')}?`
        : `${i18n.t('common:confirm removal user')}{name}?`;
      const [prev, after] = title.split('{name}');
      title = <span>{prev} <b>{`${user.nick} (${(user.name) || i18n.t('common:empty')})`}</b> {after}</span>;
      userIds = [user.userId];
    }
    Modal.confirm({
      title,
      onOk: () => {
        removeMember(
          { userIds, scope },
          {
            ...state.queryParams,
            pageNo: paging.pageNo,
            pageSize: paging.pageSize,
          } as Omit<MEMBER.GetListQuery, 'scope'>
        ).then(() => {
          isArray(user) && updater.selectedKeys([]);
        });
      },
    });
  }, [paging.pageNo, paging.pageSize, removeMember, scope, state.queryParams, updater]);

  const columns = React.useMemo(() => [
    {
      title: i18n.t('nick'),
      dataIndex: 'nick',
      render: (nick: string, record: IMember) => {
        const { userId, removed } = record;
        return (
          <div className="member-username nowrap">
            <span>{nick || i18n.t('common:empty')}</span>
            <IF check={currentUserId === userId}>
              <span className="member-username-info"> [{i18n.t('current user')}]</span>
            </IF>
            <IF check={removed}>
              <span className="member-username-info"> [{i18n.t('exit from the organization')}]</span>
            </IF>
          </div>
        );
      },
    },
    {
      title: i18n.t('user name'),
      dataIndex: 'name',
      render: (name: string) => {
        return (
          <div className="member-username nowrap">
            <span>{name || i18n.t('common:empty')}</span>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (value: string) => (
        <Tooltip title={value}>
          <span
            className="for-copy"
            data-clipboard-tip="Email"
            data-clipboard-text={value}
          >
            {value || i18n.t('common:empty')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: i18n.t('cellphone'),
      dataIndex: 'mobile',
      render: (value: string | number) => (
        <span
          className="for-copy"
          data-clipboard-tip={i18n.t('cellphone')}
          data-clipboard-text={value}
        >
          {value || i18n.t('common:empty')}
        </span>
      ),
    },
    {
      title: i18n.t('role'),
      dataIndex: 'roles',
      render: (roles: string[]) => {
        const rolesStr = map(roles, role => roleMap[role] || i18n.t('common:other')).join(',');
        return (
          <div className="members-list-role-operate nowrap">
            <Tooltip title={rolesStr}>
              <span className="role-tag">{rolesStr}</span>
            </Tooltip>
          </div>
        );
      },
    },
    ...insertWhen(scope.type === MemberScope.ORG, [{
      title: i18n.t('member label'),
      dataIndex: 'labels',
      render: (val: string[]) => {
        const curLabels = map(val, item => {
          const labelObj = find(memberLabels, { label: item }) || { name: item, label: item };
          return <div className='members-list-label-item' key={labelObj.label}>{labelObj.name}</div>;
        });
        return (
          <div className="members-list-label nowrap">
            <Tooltip
              title={curLabels}
              getPopupContainer={(triggerNode: unknown) => get(triggerNode, 'parentElement')}
            >
              {curLabels}
            </Tooltip>
          </div>
        );
      },
    }]),
    ...insertWhen(!readOnly, [{
      title: i18n.t('operations'),
      key: 'op',
      width: 150,
      render: (record: IMember) => {
        const { userId, removed, labels } = record;
        const isCurrentUser = currentUserId === userId;
        const editOp = memberAuth.edit
          ? <span className="table-operations-btn" key="edit" onClick={() => updater.editMember({ ...record, labels: labels || [] })}>{i18n.t('edit')}</span>
          : null;
        const removeOp = (isCurrentUser || memberAuth.delete)
          ?
          (
            <span className="table-operations-btn" key="del" onClick={() => confirmDelete(record, isCurrentUser)}>
              {
                isCurrentUser
                  ? i18n.t('exit')
                  : memberAuth.delete ? i18n.t('remove') : null
              }
            </span>
          )
          : null;
        const authorizeOp = (showAuthorize && memberAuth.showAuthorize)
          ?
          (
            <span className="table-operations-btn" key="authorize" onClick={() => updater.authorizeMember(record)}>
              {i18n.t('authorize')}
            </span>
          )
          : null;

        return (
          <div className="table-operations">
            {updateMembers && !removed ? editOp : null}
            {authorizeOp}
            {removeOp}
          </div>
        );
      },
    }]),
  ], [confirmDelete, currentUserId, memberAuth.delete, memberAuth.edit, memberAuth.showAuthorize, memberLabels, readOnly, roleMap, scope.type, showAuthorize, updateMembers, updater]);

  const memoTable = React.useMemo(() => {
    const onChangePage = (no: number) => {
      updater.queryParams({ ...state.queryParams, pageNo: no });
    };
    return (
      <Table
        rowKey={'userId'}
        rowSelection={{
          selectedRowKeys: state.selectedKeys,
          onChange: onTableSelectChange,
        }}
        rowClassName={(record: IMember) => (record.removed ? 'not-allowed' : '')}
        pagination={{ ...paging, onChange: onChangePage }}
        columns={columns}
        dataSource={list}
      />
    );
  }, [columns, list, onTableSelectChange, paging, state.queryParams, state.selectedKeys, updater]);

  const filterList = [
    {
      name: 'query',
      placeholder: i18n.t('search by nickname, username, email or mobile number'),
      style: { width: '260px' },
    },
    {
      type: 'select',
      name: 'queryRole',
      placeholder: i18n.t('select role'),
      allowClear: true,
      options: map(roleMap, (name, value) => ({ name, value })),
    },
    ...insertWhen(scope.type === MemberScope.ORG && !isEmpty(memberLabels), [{
      name: 'label',
      type: 'select',
      placeholder: i18n.t('select member label'),
      allowClear: true,
      mode: 'multiple',
      options: map(memberLabels, item => ({ name: item.name, value: item.label })),
    }]),
  ];

  return (
    <div className="member-table-manage">
      <Spin spinning={getLoading || removeLoading || addLoading || updateLoading}>
        <div className="member-table-manage-list">
          <AddMemberModal
            scope={scope}
            visible={state.addModalVisible}
            roleMap={roleMap}
            memberLabels={memberLabels}
            queryParams={state.queryParams}
            toggleModal={() => updater.addModalVisible(false)}
          />
          <FormModal
            title={
              state.batchEditVisible
                ? i18n.t('common:batch set the role of member')
                : i18n.t('common:set the role of member {user}', { user: state.editMember && state.editMember.nick })
            }
            alertProps={
              state.batchEditVisible
                ? {
                  message: i18n.t('common:batch change role warning'),
                  type: 'warning',
                  showIcon: true,
                  className: 'mb8',
                }
                : undefined
            }
            formData={state.editMember}
            fieldsList={fieldsList}
            visible={!!state.editMember || state.batchEditVisible}
            onOk={updateRole}
            onCancel={handleCloseEditModal}
          />
          <BatchAuthorizeMemberModal
            projectId={params.projectId}
            visible={state.batchAuthorizeVisible}
            onOk={handleBatchAuthorize}
            onCancel={() => updater.batchAuthorizeVisible(false)}
            alertProps={{
              message: i18n.t('common:batch change role warning'),
              type: 'warning',
              showIcon: true,
              className: 'mb8',
            }}
          />
          <AuthorizeMemberModal
            key={state.authorizeMember ? 'show' : 'hide'} // 关闭后销毁
            type={scope.type}
            member={state.authorizeMember as IMember | null}
            closeModal={() => updater.authorizeMember(null)}
          />
          <UrlInviteModal
            visible={state.inviteModalVisible}
            url={`${window.location.origin}${goTo.resolve.inviteToOrg()}`}
            linkPrefixTip={`${i18n.t('org:visit the link to join the company')} [${orgDisplayName || orgName}]`}
            code={state.verifyCode}
            tip={i18n.t('org:url invite tip')}
            onCancel={() => updater.inviteModalVisible(false)}
            modalProps={{ width: 600 }}
          />
          <div className="members-list">
            <FilterGroup
              list={filterList}
              onChange={debounce(onSearchMembers, 400)}
              reversePosition
            >
              <>
                {memberAuth.add && !readOnly ? <Button type="primary" ghost onClick={() => updater.addModalVisible(true)}>{i18n.t('add member')}</Button> : null}
                {
                  memberAuth.invite && !readOnly
                    ? <Button loading={getInviteLoading} onClick={handleGenOrgInviteCode}>{i18n.t('invite')}</Button>
                    : null
                }
                {
                  hideBatchOps
                    ? null
                    : (
                      <DropdownSelect
                        menuList={batchOptions}
                        onClickMenu={onBatchClick}
                        disabled={isEmpty(state.selectedKeys)}
                        buttonText={i18n.t('project:batch processing')}
                      />
                    )
                }
              </>
            </FilterGroup>
            {memoTable}
            <Copy selector=".for-copy" />
          </div >
        </div>
      </Spin>
    </div>
  );
};

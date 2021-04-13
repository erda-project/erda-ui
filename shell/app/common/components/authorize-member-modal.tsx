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

import routeInfoStore from 'app/common/stores/route';
import { MemberScope } from 'app/common/stores/_member';
import { getApps } from 'common/services';
import appMemberStore from 'common/stores/application-member';
import i18n from 'i18n';
import { map, compact, isEmpty } from 'lodash';
import { Modal, Select, Table, Button } from 'app/nusi';
import orgMemberStore from 'common/stores/org-member';
import projectMemberStore from 'common/stores/project-member';
import * as React from 'react';
import { useTempPaging } from './use-hooks';
import { useEffectOnce } from 'react-use';

const { Option } = Select;

interface IProps {
  member: IMember | null;
  type: MemberScope;
  closeModal(): void;
}

const storeMap = {
  [MemberScope.PROJECT]: projectMemberStore,
  [MemberScope.ORG]: orgMemberStore,
  [MemberScope.APP]: appMemberStore,
};

export const AuthorizeMemberModal = ({
  type,
  member,
  closeModal,
}: IProps) => {
  const memberStore = storeMap[type];
  const { updateMembers, removeMember } = memberStore.effects;
  const { getRoleMap } = appMemberStore.effects;// 应用授权，只查询项目的角色
  const roleMap = appMemberStore.useStore(s => s.roleMap);
  const { params } = routeInfoStore.getState(s => s);

  const [list, paging, loading, load, clear] = useTempPaging<IApplication>({
    service: getApps,
    basicParams: { projectId: params.projectId, memberID: member && member.userId },
  });

  useEffectOnce(() => {
    getRoleMap({ scopeType: MemberScope.APP });
    if (member) {
      load();
    }
    return () => clear();
  });

  const pagination = {
    total: paging.total,
    current: paging.pageNo,
    pageSize: paging.pageSize,
    onChange: (no: number) => load({ pageNo: no }),
  };
  const columns = [
    {
      title: i18n.t('application'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('role'),
      dataIndex: 'memberRoles',
      render: (text: string, record: IApplication) => {
        return (
          <Select
            style={{ width: 180 }}
            value={text || undefined}
            mode='multiple'
            onChange={(v: string[]) => {
              if (member) {
                const payload = { scope: { id: String(record.id), type: MemberScope.APP }, userIds: [member.userId] };
                if (!isEmpty(compact(v))) {
                  updateMembers({ ...payload, roles: v }, { forbidReload: true }).then(() => {
                    load({ pageNo: paging.pageNo });
                  });
                } else {
                  removeMember({ ...payload, needReload: false }).then(() => {
                    load({ pageNo: paging.pageNo });
                  });
                }
              }
            }}
            placeholder={`${i18n.t('project:please set ')}`}
          >
            <Option value="">{i18n.t('not member')}</Option>
            {
              map(roleMap, (v: string, k: string) => (<Option key={k} value={k}>{v}</Option>))
            }
          </Select>
        );
      },
    },
  ];


  return (
    <Modal
      title={i18n.t('authorize user {user}', { user: member ? member.nick || member.name : '' })}
      visible={!!member}
      onOk={closeModal}
      onCancel={closeModal}
      destroyOnClose
      maskClosable={false}
      footer={[
        <Button type="primary" key="back" onClick={closeModal}>
          {i18n.t('close')}
        </Button>,
      ]}
    >
      <Table
        loading={loading}
        rowKey={'userId'}
        pagination={pagination}
        columns={columns}
        dataSource={list}
      />
    </Modal>
  );
};

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

import React from 'react';
import moment from 'moment';
import i18n from 'i18n';
import { head, isEmpty, map, take } from 'lodash';
import { Button, message, Modal, Select, Spin, Table, Tooltip } from 'antd';
import { Avatar, ErdaIcon, FormModal, MemberSelector } from 'common';
import { useSwitch, useUpdate } from 'common/use-hooks';
import { ColumnProps, FormInstance } from 'core/common/interface';
import { useMount, useUnmount } from 'react-use';
import { useUserMap } from 'core/stores/userMap';
import { useLoading } from 'core/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';
import ExternalUserModal from './external-user-table';
import agent from 'agent';

import './index.scss';

const { confirm } = Modal;

enum TargetType {
  USER = 'user',
  EXTERNAL_USER = 'external_user',
  DINGDING = 'dingding',
  WEBHOOK = 'webhook',
  ROLE = 'role',
}

export const notifyChannelOptionsMap = {
  [TargetType.DINGDING]: [{ name: i18n.t('DingTalk'), value: 'dingding' }],
  [TargetType.USER]: [
    { name: i18n.t('dop:email'), value: 'email' },
    { name: i18n.t('site message'), value: 'mbox' },
  ],
  [TargetType.EXTERNAL_USER]: [{ name: i18n.t('dop:email'), value: 'email' }],
  [TargetType.WEBHOOK]: [{ name: i18n.t('dop:webhook'), value: 'webhook' }],
  [TargetType.ROLE]: [
    { name: i18n.t('dop:email'), value: 'email' },
    { name: i18n.t('site message'), value: 'mbox' },
  ],
};

// 当群组为成员或外部成员时，通知方式包含 电话/短信
export const smsNotifyChannelOptionsMap = Object.assign({}, notifyChannelOptionsMap, {
  [TargetType.USER]: [
    { name: i18n.t('dop:email'), value: 'email' },
    { name: i18n.t('site message'), value: 'mbox' },
    { name: i18n.t('SMS'), value: 'sms' },
    { name: i18n.t('phone'), value: 'vms' },
  ],
  [TargetType.EXTERNAL_USER]: [
    { name: i18n.t('dop:email'), value: 'email' },
    { name: i18n.t('SMS'), value: 'sms' },
    { name: i18n.t('phone'), value: 'vms' },
  ],
});

const groupTargetMap = {
  user: i18n.t('member'),
  dingding: i18n.t('DingTalk address'),
  webhook: i18n.t('dop:external api'),
  external_user: i18n.t('dop:external user'),
  role: i18n.t('member role'),
};

// const notifyRoleMap = {
//   Manager: i18n.t('administrator'),
//   Developer: i18n.t('developer'),
//   Tester: i18n.t('tester'),
//   Operator: i18n.t('cmp:operator'),
// };

interface IProps {
  commonPayload: {
    scopeType: string;
    scopeId: string;
    projectId?: string;
  };
  memberStore: any;
}

export const ListTargets = ({
  targets = [],
  roleMap,
}: {
  targets: COMMON_STRATEGY_NOTIFY.INotifyTarget[];
  roleMap: any;
}) => {
  const userMap = useUserMap();
  const { values = [], type } = targets[0] || {};
  const firstValue = head(values)?.receiver as string;
  let text = '';
  let targetsEle = (
    <>
      <ErdaIcon fill="black-400" size="16" type="sidebarUser" className="color-text-desc mr-1" />
      <Tooltip title={`${i18n.t('dop:group address')}: ${firstValue}`}>
        <span className="group-address nowrap">{`${i18n.t('dop:group address')}: ${firstValue}`}</span>
      </Tooltip>
    </>
  );
  switch (type) {
    case TargetType.USER:
      text = `${userMap[firstValue] ? userMap[firstValue].nick : '--'} ${i18n.t('dop:and {length} others', {
        length: values.length,
      })}`;
      targetsEle = (
        <>
          <div className="group-members mr-2">
            {map(take(values, 6), (obj: { receiver: string }) => (
              <Avatar name={obj.receiver} size={24} key={obj.receiver} />
            ))}
          </div>
          <Tooltip title={text}>
            <span className="nowrap">{text}</span>
          </Tooltip>
        </>
      );
      break;
    case TargetType.EXTERNAL_USER:
      text = `${JSON.parse(firstValue).username} ${i18n.t('dop:and {length} others', {
        length: values.length,
      })}`;
      targetsEle = (
        <>
          <div className="group-members mr-2">
            {map(take(values, 3), (obj: { receiver: string }) => {
              const { username } = JSON.parse(obj.receiver);
              return <Avatar name={username} size={24} key={username} />;
            })}
          </div>
          <Tooltip title={text}>
            <span className="nowrap">{text}</span>
          </Tooltip>
        </>
      );
      break;
    case TargetType.ROLE:
      text = `${i18n.t('dop:notify role')}：${map(values, (obj) => roleMap[obj.receiver]).join(',')}`;
      targetsEle = (
        <>
          <ErdaIcon fill="black-400" size="16" type="sidebarUser" className="mr-1" />
          <Tooltip title={text}>
            <span className="group-address nowrap">{text}</span>
          </Tooltip>
        </>
      );
      break;
    default:
      break;
  }
  return targetsEle;
};

const NotifyGroup = ({ memberStore, commonPayload }: IProps) => {
  const notifyGroups = notifyGroupStore.useStore((s) => s.notifyGroups);
  const userMap = useUserMap();
  const formRef = React.useRef<FormInstance>(null);

  const roleMap = memberStore.useStore((s) => s.roleMap);
  const { getRoleMap } = memberStore.effects;

  const { getNotifyGroups, deleteNotifyGroups, createNotifyGroups, updateNotifyGroups } = notifyGroupStore.effects;
  const { clearNotifyGroups } = notifyGroupStore.reducers;
  const [loading] = useLoading(notifyGroupStore, ['getNotifyGroups']);
  const [modalVisible, openModal, closeModal] = useSwitch(false);
  const [{ activedData, groupType }, updater, update] = useUpdate({
    activedData: {},
    groupType: '',
  });
  const isEditing = !isEmpty(activedData);

  const isInMsp = commonPayload.scopeType.includes('msp');

  const memberSelectProps = isInMsp
    ? {
        ...commonPayload,
        scopeType: 'msp',
      }
    : commonPayload;

  const scope = isInMsp ? 'msp' : commonPayload.scopeType;

  useMount(() => {
    handleGetNotifyGroups();
    getRoleMap({
      scopeType: scope,
      scopeId: commonPayload.scopeId,
    });
  });

  useUnmount(() => {
    clearNotifyGroups();
  });

  const handleGetNotifyGroups = (payload?: COMMON_NOTIFY.IGetNotifyGroupQuery) => {
    getNotifyGroups({ ...commonPayload, ...payload });
  };

  const handleEdit = ({ name, targets, id }: COMMON_NOTIFY.INotifyGroup) => {
    openModal();
    const { type, values } = targets[0];
    let _targets;
    switch (type) {
      case TargetType.USER:
      case TargetType.EXTERNAL_USER:
      case TargetType.ROLE:
        _targets = map(values, (v) => v.receiver);
        break;
      case TargetType.WEBHOOK:
        _targets = values[0]?.receiver;
        break;
      default:
        _targets = values[0];
        break;
    }
    update({
      groupType: type,
      activedData: {
        id,
        name,
        targetType: type,
        targets: _targets,
      },
    });
  };

  const handleDele = (id: number) => {
    confirm({
      title: i18n.t('dop:are you sure you want to delete this item?'),
      content: i18n.t('dop:the notification group will be permanently deleted'),
      onOk() {
        deleteNotifyGroups({ id, scopeType: commonPayload.scopeType }).then(() => {
          handleGetNotifyGroups();
        });
      },
    });
  };

  const handleSubmit = (values: any, id?: number) => {
    const { name, targetType, targets } = values;
    let _values = [];
    switch (targetType) {
      case TargetType.USER:
        _values = targets.filter((item: string) => !!item).map((t: string) => ({ receiver: t }));
        break;
      case TargetType.ROLE:
      case TargetType.EXTERNAL_USER:
        _values = targets.map((t: string) => ({ receiver: t }));
        break;
      case TargetType.WEBHOOK:
        _values = [{ receiver: targets }];
        break;
      case TargetType.DINGDING:
        _values = [targets];
        break;
      default:
        break;
    }
    if (isEditing) {
      updateNotifyGroups({
        id,
        name,
        targets: [
          {
            type: targetType,
            values: _values,
          },
        ],
      }).then(() => {
        handleCancel();
        handleGetNotifyGroups();
      });
      return;
    }
    createNotifyGroups({
      ...commonPayload,
      name,
      targets: [
        {
          type: targetType,
          values: _values,
        },
      ],
    }).then(() => {
      handleCancel();
      handleGetNotifyGroups();
    });
  };

  const handleCancel = () => {
    update({
      groupType: '',
      activedData: {},
    });
    closeModal();
  };

  const fieldsList = [
    {
      name: 'name',
      label: i18n.t('cmp:group name'),
      required: true,
      itemProps: {
        disabled: isEditing,
        maxLength: 50,
      },
    },
    {
      name: 'targetType',
      label: i18n.t('dop:notified to'),
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            defaultValue={groupType}
            onSelect={(value: any) => {
              updater.groupType(value);
              form.setFieldsValue({ targets: undefined });
            }}
          >
            {map(groupTargetMap, (name, value) => (
              <Select.Option value={value} key="value">
                {name}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
  ] as any[];

  let targetField;
  const extraFields: any[] = [];
  const testDingTalk = () => {
    const values = formRef.current?.getFieldsValue();
    const { secret, receiver } = values.targets;
    if (!secret || !receiver) {
      message.warn(i18n.t('common:please complete Dingding address and signature'));
      return;
    }
    return agent
      .post('/api/admin/notify/dingtalk-test')
      .send({
        secret,
        webhook: receiver,
      })
      .then((response: any) => {
        if (response.body.data.success) {
          message.success(i18n.t('common:sent successfully, please check the test information in the group'));
        } else {
          message.warn(i18n.t('common:sending failed, please check the configuration information'));
        }
      });
  };

  switch (groupType) {
    case TargetType.USER:
      targetField = {
        name: 'targets',
        label: groupTargetMap[groupType],
        required: true,
        getComp: () => {
          return <MemberSelector {...memberSelectProps} mode="multiple" type="Category" />;
        },
      };
      break;
    case TargetType.DINGDING:
      targetField = {
        name: ['targets', 'receiver'],
        label: groupTargetMap[groupType],
        type: 'textArea',
        required: true,
        itemProps: {
          maxLength: 200,
        },
      };
      extraFields.push({
        name: ['targets', 'secret'],
        label: i18n.t('dop:signature'),
        type: 'textArea',
        required: true,
        itemProps: {
          maxLength: 200,
        },
        suffix: (
          <span className="notify-test-dingtalk" onClick={() => testDingTalk()}>
            {i18n.t('common:send test notification')}
          </span>
        ),
      });
      break;
    case TargetType.WEBHOOK:
      targetField = {
        name: 'targets',
        label: groupTargetMap[groupType],
        type: 'textArea',
        required: true,
        itemProps: {
          maxLength: 200,
        },
      };
      break;
    case TargetType.EXTERNAL_USER:
      targetField = {
        name: 'targets',
        label: groupTargetMap[groupType],
        required: true,
        getComp: () => <ExternalUserModal />,
      };
      break;
    case TargetType.ROLE:
      targetField = {
        name: 'targets',
        label: groupTargetMap[groupType],
        required: true,
        type: 'select',
        options: map(roleMap, (name, value) => ({ value, name })),
        itemProps: {
          mode: 'multiple',
        },
      };
      break;
    default:
      break;
  }

  groupType && fieldsList.push(targetField);
  fieldsList.push(...extraFields);

  const columns: Array<ColumnProps<COMMON_NOTIFY.INotifyGroup>> = [
    {
      title: i18n.t('dop:notification name'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: i18n.t('default:notification target'),
      dataIndex: 'targets',
      className: 'notify-info',
      ellipsis: true,
      render: (targets) => (
        <div className="flex-div flex truncate">
          <ListTargets targets={targets} roleMap={roleMap} />
        </div>
      ),
    },
    {
      title: i18n.t('default:creator'),
      dataIndex: 'creator',
      width: 160,
      render: (text) => userMap[text]?.nick,
    },
    {
      title: i18n.t('default:create time'),
      dataIndex: 'createdAt',
      width: 176,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('default:operation'),
      dataIndex: 'id',
      width: 160,
      fixed: 'right',
      render: (id: number, record) => {
        return (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => handleEdit(record)}>
              {i18n.t('edit')}
            </span>
            <span
              className="table-operations-btn"
              onClick={() => {
                handleDele(id);
              }}
            >
              {i18n.t('delete')}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="notify-group-manage">
      <Tooltip title={i18n.t('dop:new notification group')}>
        <div
          className="notify-group-action hover-active"
          onClick={() => {
            openModal();
          }}
        >
          <Button type="primary">{i18n.t('dop:new notification group')}</Button>
        </div>
      </Tooltip>
      <FormModal
        width={800}
        ref={formRef}
        title={`${isEditing ? i18n.t('dop:edit group') : i18n.t('dop:new Group')}`}
        visible={modalVisible}
        fieldsList={fieldsList}
        formData={activedData}
        onOk={(values: any) => {
          handleSubmit(values, isEditing && activedData.id);
        }}
        onCancel={handleCancel}
        modalProps={{ destroyOnClose: true }}
      />
      <Spin spinning={loading}>
        <Table rowKey="id" dataSource={notifyGroups} columns={columns} pagination={false} scroll={{ x: 800 }} />
      </Spin>
    </div>
  );
};

export default NotifyGroup;

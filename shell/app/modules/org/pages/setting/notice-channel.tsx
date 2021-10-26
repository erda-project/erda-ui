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
import { isEmpty, map } from 'lodash';
import { Button, Modal, Select, Spin, Table, Tooltip, Switch } from 'core/nusi';
import { FormModal } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useUserMap } from 'core/stores/userMap';
import { ColumnProps, FormInstance } from 'core/common/interface';
import { useMount } from 'react-use';
import { useLoading } from 'core/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';

const { confirm } = Modal;

const NotifyChannel = () => {
  const notifyChannels = notifyGroupStore.useStore((s) => s.notifyChannels);
  const userMap = useUserMap();
  const { setNotifyChannelEnable, deleteNotifyChannel, addNotifyChannel, editNotifyChannel, getNotifyChannels } =
    notifyGroupStore.effects;
  const [loading] = useLoading(notifyGroupStore, ['getNotifyChannels']);
  const [visible, setIsVisible] = React.useState(false);
  const [{ activeData, channelTypes, providerTypes }, updater, update] = useUpdate({
    activeData: {},
    channelTypes: [],
    providerTypes: [],
  });
  const isEditing = !isEmpty(activeData);

  useMount(() => {
    handleGetNotifyChannels();
  });

  const handleGetNotifyChannels = (payload?: COMMON_NOTIFY.IGetNotifyGroupQuery) => {
    getNotifyChannels({ page: 1, pageSize: 15 });
  };

  const handleEdit = ({ channelProviderType, config, name, type, id }: COMMON_NOTIFY.NotifyChannel) => {
    setIsVisible(true);

    update({
      activeData: {
        id,
        channelProviderType,
        config,
        type,
        name,
      },
    });
  };

  const handleDele = (id: string) => {
    confirm({
      title: i18n.t('application:are you sure you want to delete this item?'),
      content: i18n.d('该通知渠道将永远删除'),
      onOk() {
        deleteNotifyChannel(id).then(() => {
          handleGetNotifyChannels();
        });
      },
    });
  };

  const handleSubmit = (values: any, id?: string) => {
    const { name, channelProviderType, type, config, enable } = values;
    if (isEditing) {
      editNotifyChannel({
        id,
        name,
        type,
        channelProviderType,
        config,
        enable,
      }).then(() => {
        handleCancel();
        handleGetNotifyChannels();
      });
      return;
    }
    addNotifyChannel({
      id,
      name,
      type,
      channelProviderType,
      config,
      enable,
    }).then(() => {
      handleCancel();
      handleGetNotifyChannels();
    });
  };

  const handleCancel = () => {
    update({
      activeData: {},
    });
    setIsVisible(false);
  };

  const fieldsList = [
    {
      name: 'name',
      label: i18n.d('渠道名称'),
      required: true,
      itemProps: {
        disabled: isEditing,
        maxLength: 50,
      },
    },
    {
      name: 'type',
      label: i18n.d('渠道类型'),
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            defaultValue={channelTypes?.[0]?.name}
            onSelect={(value: any) => {
              updater.channelTypes(value);
            }}
          >
            {map(channelTypes, ({ displayName, name }) => (
              <Select.Option value={name} key={name}>
                {displayName}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      name: 'channelProviderType',
      label: i18n.d('服务商'),
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            defaultValue={channelTypes?.[0]?.provider?.name}
            onSelect={(value: any) => {
              updater.channelTypes(value);
            }}
          >
            {map(providerTypes, ({ displayName, name }) => (
              <Select.Option value={name} key={name}>
                {displayName}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      name: 'config.accessKey',
      label: 'AccessKey',
      required: true,
      itemProps: {
        disabled: isEditing,
        maxLength: 50,
      },
    },
    {
      name: 'config.accessKeySecret',
      label: 'AccessKeySecret',
      required: true,
      itemProps: {
        disabled: isEditing,
        maxLength: 50,
      },
    },
    {
      name: 'config.accessKeySecret',
      label: i18n.d('短信签名'),
      required: true,
      itemProps: {
        maxLength: 500,
      },
    },
    {
      name: 'config.accessKeySecret',
      label: i18n.d('短信模板'),
      required: true,
      itemProps: {
        maxLength: 500,
      },
    },
  ] as any[];

  const columns: Array<ColumnProps<COMMON_NOTIFY.NotifyChannel>> = [
    {
      title: i18n.d('渠道名称'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: i18n.d('渠道类型'),
      width: 160,
      dataIndex: 'type',
      className: 'notify-info',
      ellipsis: true,
      render: (type) => type.displayName,
    },
    {
      title: i18n.d('服务商'),
      dataIndex: 'channelProviderType',
      width: 200,
      render: (provider) => provider.displayName,
    },
    {
      title: i18n.t('default:creator'),
      dataIndex: 'creatorName',
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
              {i18n.t('application:edit')}
            </span>
            <span
              className="table-operations-btn"
              onClick={() => {
                handleDele(id);
              }}
            >
              {i18n.t('application:delete')}
            </span>
            <Switch
              size="small"
              defaultChecked={record.enable}
              onChange={() => {
                setNotifyChannelEnable({
                  id: record.id,
                  enable: !record.enable,
                }).then(() => {
                  handleGetNotifyChannels({ page: 1 });
                });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="notify-group-manage">
      <Tooltip title={i18n.t('新建通知渠道')}>
        <div
          className="notify-group-action hover-active"
          onClick={() => {
            setIsVisible(true);
          }}
        >
          <Button type="primary">{i18n.d('新建通知渠道')}</Button>
        </div>
      </Tooltip>
      <FormModal
        width={800}
        title={`${isEditing ? i18n.d('编辑通知渠道') : i18n.t('新建通知渠道')}`}
        visible={visible}
        fieldsList={fieldsList}
        formData={activeData}
        onOk={(values: any) => {
          handleSubmit(values, isEditing && activeData.id);
        }}
        onCancel={handleCancel}
        modalProps={{ destroyOnClose: true }}
      />
      <Spin spinning={loading}>
        <Table rowKey="id" dataSource={notifyChannels} columns={columns} pagination={false} scroll={{ x: 800 }} />
      </Spin>
    </div>
  );
};

export default NotifyChannel;

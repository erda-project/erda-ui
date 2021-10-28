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
import { Button, Modal, Select, Spin, Table, Tooltip, Switch } from 'antd';
import { FormModal } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useUserMap } from 'core/stores/userMap';
import { ColumnProps, FormInstance } from 'app/interface/common';
import { useMount } from 'react-use';
import { useLoading } from 'core/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';
import { PAGINATION } from 'app/constants';
import { getNotifyChannelTypes, getNotifyChannels } from 'application/services/notify-group';

const { confirm } = Modal;

const NotifyChannel = () => {
  const channelTypeOptions = getNotifyChannelTypes.useData();
  const { setNotifyChannelEnable, deleteNotifyChannel, addNotifyChannel, editNotifyChannel } = notifyGroupStore.effects;
  const [data, loading] = getNotifyChannels.useState();
  const [{ activeData, channelType, channelProvider, visible, paging }, updater, update] = useUpdate({
    activeData: {},
    channelType: '',
    channelProvider: '',
    visible: false,

    paging: { pageSize: 15, current: 1 },
  });
  const channelProviderOptions = channelTypeOptions?.find((item) => item.name === channelType)?.providers;

  const isEditing = !isEmpty(activeData);
  useMount(() => {
    getNotifyChannelTypes.fetch();
  });

  React.useEffect(() => {
    getNotifyChannels.fetch({ page: paging.current, pageSize: paging.pageSize });
  }, [paging]);

  const handleEdit = ({ channelProviderType, config, name, type, id }: COMMON_NOTIFY.NotifyChannel) => {
    update({
      activeData: {
        id,
        channelProviderType: channelProviderType.name,
        config,
        type: type.name,
        name,
      },
      visible: true,
    });
  };

  const handleAdd = () => {
    updater.channelType(channelTypeOptions?.[0]?.name);
    updater.channelProvider(channelTypeOptions?.[0]?.providers?.[0]?.name);
    updater.visible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: i18n.t('application:are you sure you want to delete this item?'),
      content: i18n.d('该通知渠道将永远删除'),
      onOk() {
        deleteNotifyChannel({ id }).then(() => {
          updater.paging({ ...paging, current: 1 });
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
        update({
          paging: { ...paging },
          visible: false,
          activeData: {},
        });
      });
      return;
    }

    addNotifyChannel({
      name,
      type,
      channelProviderType,
      config,
      enable,
    }).then(() => {
      update({
        paging: { ...paging, current: 1 },
        visible: false,
        activeData: {},
      });
    });
  };

  const handleCancel = () => {
    update({
      activeData: {},
      visible: false,
    });
  };

  const handleTableChange = (pagination: { current: number; pageSize: number }) => {
    updater.paging(pagination);
  };

  const fieldsList = [
    {
      name: 'name',
      label: i18n.d('渠道名称'),
      required: true,
      itemProps: {
        maxLength: 50,
      },
    },
    {
      name: 'type',
      label: i18n.d('渠道类型'),
      initialValue: channelType,
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            onSelect={(value: any) => {
              updater.channelType(value);
              form.setFieldsValue({ type: value });
            }}
          >
            {map(channelTypeOptions, ({ displayName, name }) => (
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
      initialValue: channelProvider,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            onSelect={(value: any) => {
              updater.channelProvider(value);
              form.setFieldsValue({ channelProviderType: value });
            }}
          >
            {map(channelProviderOptions, ({ displayName, name }) => (
              <Select.Option value={name} key={name}>
                {displayName}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      name: 'config.accessKeyId',
      label: 'accessKeyId',
      required: true,
      itemProps: {
        maxLength: 50,
      },
    },
    {
      name: 'config.accessKeySecret',
      label: 'accessKeySecret',
      required: true,
      itemProps: {
        maxLength: 50,
      },
    },
    {
      name: 'config.signName',
      label: i18n.d('短信签名'),
      required: true,
      itemProps: {
        maxLength: 500,
      },
    },
    {
      name: 'config.templateCode',
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
      // render: (text) => userMap[text]?.nick,
    },
    {
      title: i18n.t('default:create time'),
      dataIndex: 'createAt',
      width: 176,
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
                handleDelete(id);
              }}
            >
              {i18n.t('application:delete')}
            </span>
            <Switch
              size="small"
              checked={record.enable}
              onChange={() => {
                setNotifyChannelEnable({
                  id: record.id,
                  enable: !record.enable,
                }).finally(() => {
                  updater.paging({ ...paging });
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
            handleAdd();
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
        <Table
          rowKey="id"
          dataSource={data?.data || []}
          columns={columns}
          pagination={{ ...paging, total: data?.total ?? 0, showSizeChanger: true }}
          scroll={{ x: 800 }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default NotifyChannel;

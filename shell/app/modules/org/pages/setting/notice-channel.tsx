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
import i18n from 'i18n';
import { isEmpty, map } from 'lodash';
import { Button, Modal, Select, Spin, Table, Tooltip, Switch, Input } from 'antd';
import { FormModal, Copy } from 'common';
import { PreviewOpen as IconPreviewOpen, PreviewCloseOne as IconPreviewCloseOne } from '@icon-park/react';
import { useUpdate } from 'common/use-hooks';
import { ColumnProps, FormInstance } from 'app/interface/common';
import { useMount } from 'react-use';
import {
  getNotifyChannelTypes,
  getNotifyChannels,
  setNotifyChannelEnable,
  addNotifyChannel,
  editNotifyChannel,
  deleteNotifyChannel,
} from 'org/services/notice-channel';

const { confirm } = Modal;

const NotifyChannel = () => {
  const channelTypeOptions = getNotifyChannelTypes.useData();
  const [data, loading] = getNotifyChannels.useState();
  const [
    { activeData, channelType, channelProvider, visible, paging, templateCode, passwordVisible },
    updater,
    update,
  ] = useUpdate({
    activeData: {},
    channelType: '',
    channelProvider: '',
    visible: false,
    templateCode: '',
    passwordVisible: false,
    paging: { pageSize: 15, current: 1 },
  });
  const channelProviderOptions = channelTypeOptions?.find((item) => item.name === channelType)?.providers;

  const isEditing = !isEmpty(activeData);
  useMount(() => {
    getNotifyChannelTypes.fetch();
  });

  React.useEffect(() => {
    getNotifyChannels.fetch({ pageNo: paging.current, pageSize: paging.pageSize });
  }, [paging]);

  const handleEdit = ({ channelProviderType, config, name, type, id }: NOTIFY_CHANNEL.NotifyChannel) => {
    update({
      activeData: {
        id,
        channelProviderType: channelProviderType.name,
        config,
        type: type.name,
        name,
      },
      visible: true,
      templateCode: config.templateCode,
    });
  };

  const handleAdd = () => {
    updater.channelType(channelTypeOptions?.[0]?.name || '');
    updater.channelProvider(channelTypeOptions?.[0]?.providers?.[0]?.name || '');
    updater.visible(true);
  };

  const handleDelete = (id: number) => {
    confirm({
      title: i18n.t('are you sure you want to delete this item?'),
      content: i18n.t('the notification channel will be permanently deleted'),
      onOk() {
        deleteNotifyChannel.fetch({ id }).then(() => {
          updater.paging({ ...paging, current: 1 });
        });
      },
    });
  };

  const handleSubmit = (values: NOTIFY_CHANNEL.IChannelBody, id?: number) => {
    const { name, channelProviderType, type, config, enable } = values;
    if (isEditing && id) {
      editNotifyChannel
        .fetch({
          id,
          name,
          type,
          channelProviderType,
          config,
          enable,
        })
        .then(() => {
          update({
            paging: { ...paging },
            visible: false,
            activeData: {},
          });
        });
      return;
    }

    addNotifyChannel
      .fetch({
        name,
        type,
        channelProviderType,
        config,
        enable,
      })
      .then(() => {
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
      label: i18n.t('channel name'),
      required: true,
      rules: [
        {
          validator: (_, value: string, callback: Function) => {
            return value && !/\s/g.test(value) ? callback() : callback(i18n.t('common:cannot contain spaces'));
          },
        },
      ],
      itemProps: {
        maxLength: 50,
        placeholder: `${i18n.t('please input channel name')}`,
      },
    },
    {
      name: 'type',
      label: i18n.t('channel type'),
      initialValue: channelType,
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            onSelect={(value: string) => {
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
      label: i18n.t('service provider'),
      required: true,
      initialValue: channelProvider,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            onSelect={(value: string) => {
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
      label: 'AccessKeyId',
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: `${i18n.t('please input')} AccessKeyId`,
      },
    },
    {
      name: 'config.accessKeySecret',
      label: 'AccessKeySecret',
      required: true,
      itemProps: {
        placeholder: `${i18n.t('please input')} AccessKeySecret`,
        type: passwordVisible ? 'text' : 'password',
        addonAfter: passwordVisible ? (
          <IconPreviewOpen onClick={() => updater.passwordVisible(false)} />
        ) : (
          <IconPreviewCloseOne onClick={() => updater.passwordVisible(true)} />
        ),
      },
    },
    {
      name: 'config.signName',
      label: i18n.t('SMS signature'),
      required: true,
      itemProps: {
        maxLength: 500,
        placeholder: `${i18n.t(
          'please input the SMS signature you have applied for on the service provider platform',
        )}`,
      },
    },
    {
      name: 'config.templateCode',
      label: i18n.t('SMS Template Code'),
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <>
            <Input
              defaultValue={isEditing ? templateCode : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                form.setFieldsValue({ config: { ...form.getFieldValue('config'), templateCode: e.target.value } });
              }}
              placeholder={`${i18n.t(
                'please input the SMS Template Code you have applied for on the service provider platform',
              )}`}
            />
            <div className="text-desc mt-4">
              {i18n.t('Submit the following information to the service provider to apply for an SMS template')}:
            </div>
            <div className="text-desc mt-2">
              <Copy
                copyText={`${i18n.t('You have a notification message from the Erda platform')}: $\{content}, ${i18n.t(
                  'please deal with it promptly',
                )}`}
              >
                {`${i18n.t('You have a notification message from the Erda platform')}: $\{content}, ${i18n.t(
                  'please deal with it promptly',
                )}`}
              </Copy>
            </div>
          </>
        );
      },
      itemProps: {
        maxLength: 500,
      },
    },
  ];

  const columns: Array<ColumnProps<NOTIFY_CHANNEL.NotifyChannel>> = [
    {
      title: i18n.t('channel name'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: i18n.t('channel type'),
      width: 160,
      dataIndex: 'type',
      className: 'notify-info',
      ellipsis: true,
      render: (type) => type.displayName,
    },
    {
      title: i18n.t('service provider'),
      dataIndex: 'channelProviderType',
      width: 200,
      render: (provider) => provider.displayName,
    },
    {
      title: i18n.t('default:creator'),
      dataIndex: 'creatorName',
      width: 160,
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
              {i18n.t('edit')}
            </span>
            <span
              className="table-operations-btn"
              onClick={() => {
                handleDelete(id);
              }}
            >
              {i18n.t('delete')}
            </span>
            <Switch
              size="small"
              checked={record.enable}
              onChange={() => {
                setNotifyChannelEnable
                  .fetch({
                    id: record.id,
                    enable: !record.enable,
                  })
                  .finally(() => {
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
      <Tooltip title={i18n.t('new notification channel')}>
        <div
          className="notify-group-action hover-active"
          onClick={() => {
            handleAdd();
          }}
        >
          <Button type="primary">{i18n.t('new notification channel')}</Button>
        </div>
      </Tooltip>
      <FormModal
        width={800}
        title={`${isEditing ? i18n.t('edit notification channel') : i18n.t('new notification channel')}`}
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

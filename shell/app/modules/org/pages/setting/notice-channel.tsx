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
import { Button, Modal, Select, Spin, Tooltip, Input, message, Badge, Tabs } from 'antd';
import Table from 'common/components/table';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { FormModal, Copy } from 'common';
import { PreviewOpen as IconPreviewOpen, PreviewCloseOne as IconPreviewCloseOne } from '@icon-park/react';
import { useUpdate } from 'common/use-hooks';
import { FormInstance } from 'app/interface/common';
import { useMount } from 'react-use';
import {
  getNotifyChannelTypes,
  getNotifyChannels,
  getNotifyChannelEnableStatus,
  setNotifyChannelEnable,
  getNotifyChannel,
  addNotifyChannel,
  editNotifyChannel,
  deleteNotifyChannel,
} from 'org/services/notice-channel';
import { ALIYUN_APPLICATION } from 'common/constants';
import './org-setting.scss';

const { confirm } = Modal;
const { TabPane } = Tabs;

interface IState {
  activeData: {
    id?: string;
    channelProviderType?: string;
    config?: object;
    type?: string;
    name?: string;
  };
  channelType: string;
  channelProvider: string;
  visible: boolean;
  paging: { current: number; pageSize: number };
  templateCode: string;
  passwordVisible: boolean;
  activeTab: string;
  channelProviderOptions: NOTIFY_CHANNEL.ChannelProvider[];
}

const NotifyChannel = () => {
  const channelTypeOptions = getNotifyChannelTypes.useData();
  const [channelDatasource, loading] = getNotifyChannels.useState();
  const [
    {
      activeData,
      channelType,
      channelProvider,
      visible,
      paging,
      templateCode,
      passwordVisible,
      activeTab,
      channelProviderOptions,
    },
    updater,
    update,
  ] = useUpdate<IState>({
    activeData: {},
    channelType: '',
    channelProvider: '',
    visible: false,
    templateCode: '',
    passwordVisible: false,
    activeTab: 'dingtalk_work_notice',
    paging: { pageSize: 15, current: 1 },
    channelProviderOptions: [],
  });

  const isEditing = !isEmpty(activeData);
  useMount(() => {
    getNotifyChannelTypes.fetch();
  });

  React.useEffect(() => {
    getNotifyChannels.fetch({ pageNo: paging.current, pageSize: paging.pageSize, type: activeTab });
  }, [paging, activeTab]);

  const handleEdit = (id: string) => {
    getNotifyChannel.fetch({ id }).then((res) => {
      const { channelProviderType, config, type, name } = res?.data || {};
      update({
        activeData: {
          id,
          channelProviderType: channelProviderType?.name,
          config,
          type: type?.name,
          name,
        },
        visible: true,
        channelType: type?.name,
        templateCode: config?.templateCode,
        channelProviderOptions: channelTypeOptions?.find((item) => item.name === type?.name)?.providers,
        channelProvider: channelProviderType?.name,
      });
    });
  };

  const handleAdd = () => {
    updater.channelType(channelTypeOptions?.find((item) => item.name === activeTab)?.name || '');
    updater.channelProviderOptions(
      channelTypeOptions?.find((item) => item.name === activeTab)?.providers as NOTIFY_CHANNEL.ChannelProvider[],
    );
    updater.channelProvider(channelTypeOptions?.find((item) => item.name === activeTab)?.providers?.[0]?.name || '');
    updater.visible(true);
  };

  const handleDelete = (id: string, enable: boolean) => {
    if (enable) {
      message.warning(i18n.t('please off the channel and then delete!'));
    } else {
      confirm({
        title: i18n.t('are you sure you want to delete this item?'),
        content: i18n.t('the notification channel will be permanently deleted'),
        onOk() {
          deleteNotifyChannel.fetch({ id }).then((res) => {
            if (res) {
              message.success(i18n.t('deleted successfully'));
            }
            updater.paging({ ...paging, current: 1 });
          });
        },
      });
    }
  };

  const handleSubmit = (values: NOTIFY_CHANNEL.IChannelBody, id?: string) => {
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
        .then((res) => {
          if (res.success) {
            message.success(i18n.t('edited successfully'));
          }
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
      .then((res) => {
        const { data: channel } = res;
        update({
          paging: { ...paging, current: 1 },
          visible: false,
          activeData: {},
          activeTab: type,
        });
        getNotifyChannelEnableStatus.fetch({ id: channel?.id, type }).then((res) => {
          const { data: status } = res || {};
          confirmEnableChannel({ status, channel });
        });
      });

    // Automatically reset the channelProvider and channelType values ​​after an interface error
    if (!isEditing) {
      updater.channelProviderOptions(
        channelTypeOptions?.find((item) => item.name === activeTab)?.providers as NOTIFY_CHANNEL.ChannelProvider[],
      );
      updater.channelProvider(channelTypeOptions?.find((item) => item.name === activeTab)?.providers?.[0]?.name || '');
      updater.channelType(channelTypeOptions?.find((item) => item.name === activeTab)?.name || '');
    }
  };

  const confirmEnableChannel = ({
    status,
    channel,
  }: {
    status: NOTIFY_CHANNEL.ChannelEnableStatus;
    channel: NOTIFY_CHANNEL.NotifyChannel;
  }) => {
    const { hasEnable, enableChannelName } = status || {};
    const [title, content] = hasEnable
      ? [
          i18n.t('Are you sure you want to switch notification channel ?'),
          i18n.t(
            'Under the same channel type, {type} type has an enabled channel {enableChannelName}, whether to switch to {name} channel ? Click ok button to confirm the switch, and close the enabled',
            { type: channel.type.displayName, enableChannelName, name: channel.name },
          ),
        ]
      : [
          i18n.t('Are you sure you want to enable the notification channel ?'),
          i18n.t(
            'There is no enabled channel in {type} type. Do you want to enable the {name} channel? Click the ok button to enable',
            { type: channel.type.displayName, name: channel.name },
          ),
        ];
    confirm({
      title,
      content,
      onOk() {
        setNotifyChannelEnable.fetch({ enable: true, id: channel.id }).then((res) => {
          updater.paging({ ...paging, current: 1 });
          if (res.success) {
            message.success(i18n.t('enabled successfully'));
          }
        });
      },
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
      itemProps: {
        disabled: isEditing,
      },
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <Select
            onSelect={(value: string) => {
              const providers = channelTypeOptions?.find((item) => item.name === value)?.providers;
              updater.channelType(value);
              updater.channelProviderOptions(providers as NOTIFY_CHANNEL.ChannelProvider[]);
              form.setFieldsValue({ type: value });
              form.setFieldsValue({
                channelProviderType: providers?.[0]?.name,
              });
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
  ];

  const dingdingFieldsList = [
    ...fieldsList,
    {
      name: ['config', 'agentId'],
      label: 'AgentId',
      type: 'inputNumber',
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: `${i18n.t('please input')} AgentId`,
        autoComplete: 'off',
      },
    },
    {
      name: ['config', 'appKey'],
      label: 'AppKey',
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: `${i18n.t('please input')} AppKey`,
        autoComplete: 'off',
      },
    },
    {
      name: ['config', 'appSecret'],
      label: 'AppSecret',
      required: true,
      itemProps: {
        placeholder: `${i18n.t('please input')} AppSecret`,
        type: passwordVisible ? 'text' : 'password',
        autoComplete: 'off',
        addonAfter: passwordVisible ? (
          <IconPreviewOpen onClick={() => updater.passwordVisible(false)} />
        ) : (
          <IconPreviewCloseOne onClick={() => updater.passwordVisible(true)} />
        ),
      },
    },
  ];

  const SMSFieldsList = [
    ...fieldsList,
    {
      name: ['config', 'accessKeyId'],
      label: 'AccessKeyId',
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: `${i18n.t('please input')} AccessKeyId`,
        autoComplete: 'off',
      },
    },
    {
      name: ['config', 'accessKeySecret'],
      label: 'AccessKeySecret',
      required: true,
      itemProps: {
        placeholder: `${i18n.t('please input')} AccessKeySecret`,
        type: passwordVisible ? 'text' : 'password',
        autoComplete: 'off',
        addonAfter: passwordVisible ? (
          <IconPreviewOpen onClick={() => updater.passwordVisible(false)} />
        ) : (
          <IconPreviewCloseOne onClick={() => updater.passwordVisible(true)} />
        ),
      },
    },
    {
      name: ['config', 'signName'],
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
      name: ['config', 'templateCode'],
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
            <div className="bg-grey px-2 py-3 rounded-sm mt-2">
              <div className="text-sub">
                {i18n.t('Submit the following information to the service provider to apply for an SMS template')}:
              </div>
              <div className="mt-2 flex items-center">
                <span className="bg-brightgray text-normal p-1 pr-4 font-semibold rounded-sm">{`${i18n.t(
                  'You have a notification message from the Erda platform',
                )}: $\{content}, ${i18n.t('please deal with it promptly')}`}</span>
                <span
                  className="text-primary cursor-pointer underline ml-2 jump-to-aliyun"
                  data-clipboard-text={`${i18n.t(
                    'You have a notification message from the Erda platform',
                  )}:  $\{content},  ${i18n.t('please deal with it promptly')}`}
                  onClick={() => window.open(ALIYUN_APPLICATION)}
                >
                  {i18n.t('copy and jump to the application page')}
                </span>
                <Copy selector=".jump-to-aliyun" />
              </div>
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
      title: i18n.t('status'),
      dataIndex: 'enable',
      width: 80,
      render: (enable) => (
        <span>
          <Badge status={enable ? 'success' : 'default'} />
          <span>{enable ? i18n.t('enable') : i18n.t('unable')}</span>
        </span>
      ),
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
      width: 200,
      show: false,
    },
  ];

  const actions: IActions<NOTIFY_CHANNEL.NotifyChannel> = {
    width: 120,
    render: (record: NOTIFY_CHANNEL.NotifyChannel) => renderMenu(record),
  };

  const renderMenu = (record: NOTIFY_CHANNEL.NotifyChannel) => {
    const { editChannel, deleteChannel, enableChannel } = {
      editChannel: {
        title: i18n.t('edit'),
        onClick: () => {
          handleEdit(record.id);
          updater.passwordVisible(false);
        },
      },
      deleteChannel: {
        title: i18n.t('delete'),
        onClick: () => {
          handleDelete(record.id, record.enable);
        },
      },
      enableChannel: {
        title: record?.enable ? i18n.t('unable') : i18n.t('enable'),
        onClick: () => {
          if (!record?.enable) {
            getNotifyChannelEnableStatus.fetch({ id: record.id, type: record.type.name }).then((res) => {
              const { data: status } = res;
              confirmEnableChannel({ status, channel: record });
            });
          } else {
            setNotifyChannelEnable
              .fetch({
                id: record.id,
                enable: false,
              })
              .then((res) => {
                updater.paging({ ...paging });
                if (res.success) {
                  message.success(i18n.t('unable successfully'));
                }
              });
          }
        },
      },
    };

    return [editChannel, deleteChannel, enableChannel];
  };

  return (
    <div className="relative notice-channel">
      <Tooltip title={i18n.t('new notification channel')}>
        <div
          className="absolute right-3 hover-active add-channel-button"
          onClick={() => {
            handleAdd();
            updater.passwordVisible(true);
          }}
        >
          <Button type="primary">{i18n.t('new notification channel')}</Button>
        </div>
      </Tooltip>
      <FormModal
        width={800}
        title={`${isEditing ? i18n.t('edit notification channel') : i18n.t('new notification channel')}`}
        visible={visible}
        fieldsList={channelType === 'short_message' ? SMSFieldsList : dingdingFieldsList}
        formData={activeData}
        onOk={(values: any) => {
          handleSubmit(values, isEditing ? activeData.id : undefined);
        }}
        onCancel={handleCancel}
        modalProps={{ destroyOnClose: true }}
      />
      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            updater.activeTab(key);
            updater.paging({ pageSize: 15, current: 1 });
          }}
        >
          <TabPane key="dingtalk_work_notice" tab={i18n.t('dingding work notice')} />
          <TabPane key="short_message" tab={i18n.t('SMS')} />
        </Tabs>
        <Table
          rowKey="id"
          dataSource={channelDatasource?.data || []}
          columns={columns}
          actions={actions}
          pagination={{ ...paging, total: channelDatasource?.total ?? 0, showSizeChanger: true }}
          scroll={{ x: 800 }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default NotifyChannel;

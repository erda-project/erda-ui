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
import { Input, Dropdown, Menu, Switch, Form, Button, message, Modal } from 'antd';
import { ErdaIcon } from 'common';
import ErdaTable from 'common/components/table';
import { uuid } from 'common/utils';
import { useUpdateEffect } from 'react-use';
import { FormInstance } from 'core/common/interface';
import { useUpdate } from 'common/use-hooks';
import { ConfigTypeMap } from '../config';
import { VariableConfigForm } from 'application/pages/settings/components/variable-config-form';
import i18n from 'i18n';

interface IProps {
  slot: React.ReactElement;
  configData: PIPELINE_CONFIG.ConfigItem[];
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  addConfig: (data: ListData) => Promise<any>;
  updateConfig: (data: ListData | ListData[]) => Promise<any>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  onEditChange?: (isEdit: boolean) => void;
}

const convertData = (data: PIPELINE_CONFIG.ConfigItem[]) => {
  return data.map((item) => ({
    key: item.key,
    encrypt: item.encrypt,
    comment: item.comment,
    value: item.value,
    uuid: item.uuid || uuid(),
  }));
};

interface ListData {
  key: string;
  encrypt: boolean;
  comment: string;
  value: string;
  uuid?: string;
}

interface IState {
  value: ListData[];
  searchValue: string;
  editData: null | ListData;
  addVisble: boolean;
}

const ListEditConfig = (props: IProps) => {
  const { configData, slot, addConfig, updateConfig, deleteConfig, onEditChange, fullConfigData } = props;
  const [form] = Form.useForm();
  const [{ value, searchValue, editData, addVisble }, updater, update] = useUpdate<IState>({
    value: convertData(configData),
    searchValue: '',
    editData: null,
    addVisble: false,
  });

  useUpdateEffect(() => {
    onEditChange?.(!!editData);
  }, [editData]);

  React.useEffect(() => {
    updater.value(convertData(configData));
  }, [configData, updater]);

  const cancel = () => updater.editData(null);

  const save = async () => {
    try {
      const row = (await form.validateFields()) as ListData;

      const newData = [...value];
      const index = newData.findIndex((item) => editData?.uuid === item.uuid);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }
      update({ value: newData, editData: null });
      updateConfig(
        newData.map((item) => ({
          key: item.key,
          encrypt: item.encrypt,
          comment: item.comment,
          value: item.value,
          type: 'kv',
        })),
      );
    } catch (errInfo) {
      console.error('------', `Validate Failed: ${JSON.stringify(errInfo)}`);
    }
  };

  const onAdd = () => {
    if (editData) {
      message.error(i18n.t('common:please save first'));
      return;
    }
    const newData = { key: '', value: '', comment: '', encrypt: false };
    form.setFieldsValue(newData);
    update({
      value: value.concat(newData),
      editData: newData,
    });
  };

  const columns = [
    {
      dataIndex: 'key',
      title: 'Key',
    },
    {
      dataIndex: 'value',
      title: 'Value',
      render: (v: string, record: PROJECT_DEPLOY.IAppParams) => (record.encrypt ? '******' : v),
    },
    {
      dataIndex: 'encrypt',
      title: i18n.t('dop:encrypt'),
      render: (v: boolean) => (v ? i18n.t('common:yes') : i18n.t('common:no')),
    },
    {
      dataIndex: 'comment',
      title: i18n.t('dop:remark'),
    },
    {
      dataIndex: 'op',
      title: i18n.t('operate'),
      render: (_, record: ListData) => {
        return (
          <div className="operate-list" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              overlay={
                <Menu theme="dark">
                  <Menu.Item key={'delete'}>
                    <span
                      onClick={() => {
                        Modal.confirm({
                          title: i18n.t('confirm to {action}', { action: i18n.t('delete') }),
                          onOk() {
                            deleteConfig(record);
                          },
                        });
                      }}
                      className="fake-link mr-1"
                    >
                      {i18n.t('delete')}
                    </span>
                  </Menu.Item>
                </Menu>
              }
              align={{ offset: [0, 5] }}
              trigger={['click']}
            >
              <ErdaIcon type="more" className="cursor-pointer p-1 bg-hover rounded-sm" />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    return {
      ...col,
      onCell: (record: ListData) => ({
        record,
        dataIndex: col.dataIndex,
        save,
        cancel,
        form,
        fullConfigData,
        list: value,
        title: col.title,
        editing: editData?.uuid === record.uuid,
      }),
    };
  });

  const filterValue = React.useMemo(
    () => (searchValue ? value.filter((item) => !item.key || item.key.includes(searchValue)) : value),
    [value, searchValue],
  );

  return (
    <>
      <div className="relative">
        <Form form={form} component={false}>
          <ErdaTable
            slot={
              <div className="flex-h-center justify-between">
                <Input
                  size="small"
                  className="w-[200px] bg-black-06 border-none ml-0.5"
                  value={searchValue}
                  prefix={<ErdaIcon size="16" fill={'default-3'} type="search" />}
                  onChange={(e) => {
                    update({
                      searchValue: e.target.value,
                    });
                  }}
                  placeholder={i18n.t('search {name}', { name: 'Key' })}
                />
                {slot}
              </div>
            }
            hideColumnConfig
            hideReload
            pagination={false}
            columns={mergedColumns}
            dataSource={filterValue}
            rowKey="key"
            onRow={(record) => ({
              onClick: () => {
                form.setFieldsValue(record);
                updater.editData(record);
              },
            })}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
          />
        </Form>
      </div>
      <Button className="ml-2 mt-2" onClick={onAdd}>
        {i18n.t('common:add')}
      </Button>
      <VariableConfigForm
        visible={addVisble}
        fullConfigData={fullConfigData}
        addType="kv"
        onCancel={() => updater.addVisble(false)}
        onOk={(data) => {
          addConfig(data).then(() => {
            updater.addVisble(false);
          });
        }}
      />
    </>
  );
};

interface EditCellProps {
  dataIndex: string;
  record: ListData;
  form: FormInstance;
  title: string;
  inputType: string;
  index: number;
  editing: boolean;
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  list: ListData[];
  children: React.ReactElement;
  cancel: () => void;
  save: () => void;
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  cancel,
  save,
  list,
  form,
  fullConfigData,
  record,
  index,
  children,
  ...restProps
}: EditCellProps) => {
  const getComp = () => {
    let Comp: React.ReactElement | null = null;
    switch (dataIndex) {
      case 'key':
        Comp = (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: i18n.t('please enter {name}', { name: 'Key' }),
              },
              {
                pattern: /^[a-zA-Z_]+[.a-zA-Z0-9_-]*$/,
                message: i18n.t(
                  'common:start with letters, which can contain letters, numbers, dots, underscores and hyphens.',
                ),
              },
              {
                validator: async (_rule: any, value: any) => {
                  const existConfig = fullConfigData?.find((item) => item.key === value);

                  if (value && value !== record.key && existConfig) {
                    const place = ConfigTypeMap[existConfig.type].type || i18n.t('common:other type');
                    throw new Error(i18n.t('{name} already exists in {place}', { name: value, place }));
                  }
                },
              },
            ]}
          >
            <Input placeholder={i18n.t('please enter {name}', { name: 'Key' })} maxLength={191} />
          </Form.Item>
        );
        break;
      case 'value':
        Comp = (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                validator: async (_rule: any, value: any) => {
                  const encrypt = form.getFieldValue('encrypt');
                  if (!encrypt && !value) {
                    throw new Error(i18n.t('please enter {name}', { name: 'Value' }));
                  }
                },
              },
            ]}
          >
            <Input placeholder={i18n.t('please enter {name}', { name: 'Value' })} maxLength={4096} />
          </Form.Item>
        );
        break;
      case 'comment':
        Comp = (
          <Form.Item name={dataIndex} style={{ margin: 0 }}>
            <Input placeholder={i18n.t('please enter {name}', { name: i18n.t('dop:remark') })} maxLength={200} />
          </Form.Item>
        );
        break;
      case 'encrypt':
        Comp = (
          <Form.Item name={dataIndex} style={{ margin: 0 }} valuePropName="checked">
            <Switch
              onChange={() => {
                form.validateFields(['value']);
              }}
            />
          </Form.Item>
        );
        break;
      case 'op':
        Comp = (
          <div className="flex-h-center">
            <span className="mr-2 fake-link text-purple-deep" onClick={save}>
              {i18n.t('save')}
            </span>
            <span className="fake-link" onClick={cancel}>
              {i18n.t('cancel')}
            </span>
          </div>
        );
        break;
      default:
        break;
    }
    return Comp;
  };

  return (
    <td onClick={(e) => editing && e.stopPropagation()} {...restProps}>
      {editing ? getComp() : children}
    </td>
  );
};

export default ListEditConfig;

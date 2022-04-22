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
import { Input, Dropdown, Menu, Switch, Form, Button, message, Modal, FormInstance } from 'antd';
import { ErdaIcon, Ellipsis } from 'common';
import ErdaTable from 'common/components/table';
import { uuid } from 'common/utils';
import { useUpdateEffect } from 'react-use';
import { useUpdate } from 'common/use-hooks';
import { ConfigTypeMap } from './config';
import i18n from 'i18n';

interface IProps {
  slot: React.ReactElement;
  configData: PIPELINE_CONFIG.ConfigItem[];
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  updateConfig: (data: PIPELINE_CONFIG.ConfigItem | PIPELINE_CONFIG.ConfigItem[]) => void;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => void;
  onEditChange?: (isEdit: boolean) => void;
}

const convertData = (data: PIPELINE_CONFIG.ConfigItem[]) => {
  return data.map((item) => ({
    ...item,
    key: item.key,
    encrypt: item.encrypt,
    comment: item.comment,
    value: item.value,
    uuid: item.uuid || uuid(),
  }));
};

interface IState {
  value: PIPELINE_CONFIG.ConfigItem[];
  searchValue: string;
  editData: null | PIPELINE_CONFIG.ConfigItem;
}

const ListEditConfig = (props: IProps) => {
  const { configData, slot, updateConfig, deleteConfig, onEditChange, fullConfigData } = props;
  const [form] = Form.useForm();
  const [{ value, searchValue, editData }, updater, update] = useUpdate<IState>({
    value: convertData(configData),
    searchValue: '',
    editData: null,
  });

  useUpdateEffect(() => {
    onEditChange?.(!!editData);
  }, [editData]);

  React.useEffect(() => {
    updater.value(convertData(configData));
  }, [configData, updater]);

  const cancel = () => {
    update({
      editData: null,
      value: value.filter((item) => item.uuid),
    });
  };

  const save = async () => {
    try {
      const row = (await form.validateFields()) as PIPELINE_CONFIG.ConfigItem;

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
          ...item,
          key: item.key,
          encrypt: item.encrypt,
          comment: item.comment,
          value: item.value,
          type: 'kv',
        })),
      );
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.error('------', `Validate Failed: ${JSON.stringify(errInfo)}`);
    }
  };

  const onAdd = () => {
    if (editData) {
      message.error(i18n.t('common:please save first'));
      return;
    }
    const newData = { key: '', value: '', comment: '', encrypt: false } as PIPELINE_CONFIG.ConfigItem;
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
      width: 200,
    },
    {
      dataIndex: 'value',
      title: 'Value',
      width: 200,
      render: (v: string, record: PROJECT_DEPLOY.IAppParams) => (record.encrypt ? '******' : v),
    },
    {
      dataIndex: 'encrypt',
      title: i18n.t('dop:Encrypt'),
      width: 100,
      render: (v: boolean) => (v ? i18n.t('common:Yes') : i18n.t('common:No')),
    },
    {
      dataIndex: 'comment',
      title: i18n.t('dop:Remark'),
      width: 200,
    },
    {
      dataIndex: 'op',
      title: i18n.t('Operations'),
      width: 100,
      render: (_: Obj, record: PIPELINE_CONFIG.ConfigItem) => {
        return (
          <div className="operate-list" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              overlay={
                <Menu theme="dark">
                  <Menu.Item key={'delete'}>
                    <span
                      onClick={() => {
                        Modal.confirm({
                          title: i18n.t('confirm to {action}', { action: i18n.t('Delete') }),
                          onOk() {
                            deleteConfig(record);
                          },
                        });
                      }}
                      className="fake-link mr-1"
                    >
                      {i18n.t('Delete')}
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
      onCell: (record: PIPELINE_CONFIG.ConfigItem) => ({
        record,
        dataIndex: col.dataIndex,
        save,
        cancel,
        form,
        fullConfigData,
        list: value,
        title: col.title,
        width: col.width,
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
                  placeholder={i18n.t('search the {name}', { name: 'key' })}
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
                if (editData && !editData.key) {
                  message.error(i18n.t('common:please save first'));
                } else {
                  form.setFieldsValue(record);
                  updater.editData(record);
                }
              },
            })}
            components={
              filterValue.length
                ? {
                    body: {
                      cell: EditableCell,
                    },
                  }
                : undefined
            }
          />
        </Form>
      </div>
      <div className="py-2 bg-default-02">
        <Button className="ml-2" onClick={onAdd}>
          {i18n.t('common:Add')}
        </Button>
      </div>
    </>
  );
};

interface EditCellProps {
  dataIndex: string;
  record: PIPELINE_CONFIG.ConfigItem;
  form: FormInstance;
  title: string;
  inputType: string;
  index: number;
  editing: boolean;
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  list: PIPELINE_CONFIG.ConfigItem[];
  children: React.ReactElement;
  width?: number;
  style?: Obj;
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
  width,
  style = {},
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
                message: i18n.t('Please enter the {name}', { name: 'Key' }),
              },
              {
                pattern: /^[a-zA-Z_]+[.a-zA-Z0-9_-]*$/,
                message: i18n.t(
                  'common:start with letters, which can contain letters, numbers, dots, underscores and hyphens.',
                ),
              },
              {
                validator: async (_rule, value: string) => {
                  const existConfig = fullConfigData?.find((item) => item.key === value);

                  if (value && value !== record.key && existConfig) {
                    const place = ConfigTypeMap[existConfig.type].type || i18n.t('common:Other Type');
                    throw new Error(i18n.t('{name} already exists in {place}', { name: value, place }));
                  }
                },
              },
            ]}
          >
            <Input placeholder={i18n.t('Please enter the {name}', { name: 'Key' })} maxLength={191} />
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
                validator: async (_rule, value: string) => {
                  const encrypt = form.getFieldValue('encrypt');
                  if (!encrypt && !value) {
                    throw new Error(i18n.t('Please enter the {name}', { name: 'Value' }));
                  }
                },
              },
            ]}
          >
            <Input placeholder={i18n.t('Please enter the {name}', { name: 'Value' })} maxLength={4096} />
          </Form.Item>
        );
        break;
      case 'comment':
        Comp = (
          <Form.Item name={dataIndex} style={{ margin: 0 }}>
            <Input placeholder={i18n.t('Please enter the {name}', { name: i18n.t('dop:Remark') })} maxLength={200} />
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
              {i18n.t('Save')}
            </span>
            <span className="fake-link" onClick={cancel}>
              {i18n.t('Cancel')}
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
    <td onClick={(e) => editing && e.stopPropagation()} style={{ ...style, maxWidth: width }} {...restProps}>
      {editing ? getComp() : <Ellipsis title={children} />}
    </td>
  );
};

export default ListEditConfig;

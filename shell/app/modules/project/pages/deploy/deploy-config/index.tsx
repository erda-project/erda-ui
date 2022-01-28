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

import * as React from 'react';
import { Modal, Tooltip, Input, Button } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { ErdaIcon, Ellipsis, IF, SimpleTabs, RadioTabs } from 'common';
import ErdaTable from 'common/components/table';
import configStore from 'app/modules/application/stores/pipeline-config';
import { map } from 'lodash';
import { useUnmount, useUpdateEffect } from 'react-use';
import { AppSelector } from 'application/common/app-selector';
import { getJoinedApps } from 'app/user/services/user';
import { ConfigTabs, ConfigTypeMap, CONFIG_ENV_MAP } from '../config';
import { VariableConfigForm } from 'application/pages/settings/components/variable-config-form';
import ListEdit from './list-edit';
import TextEdit from './text-edit';
import { goTo } from 'common/utils';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import './index.scss';

interface IState {
  selectedEnv: string;
  selectedType: 'text' | 'other';
  editing: boolean;
}

const ConfigContainer = () => {
  const { env: routeEnv, projectId } = routeInfoStore.useStore((s) => s.params);
  const [selectedApp, setSelectedApp] = React.useState<IApplication | null>(null);
  const [editing, setEditing] = React.useState(false);

  const env = routeEnv?.toUpperCase();

  const AppSelectorSlot = (
    <AppSelector
      autoSelect
      className="project-app-selector"
      value={selectedApp?.id || ''}
      getData={(_q: { pageNo: number; pageSize: number }) => {
        return getJoinedApps({ projectID: +projectId, ..._q }).then((res) => res.data);
      }}
      disabled={editing}
      onClickItem={(app) => setSelectedApp(app)}
      resultsRender={() => {
        return (
          <div className="w-[160px] h-7 rounded-sm  leading-7 px-2 flex text-default-3 hover:text-default-8">
            {selectedApp ? (
              <Ellipsis className="font-bold text-default" title={selectedApp?.displayName || selectedApp?.name} />
            ) : (
              <span className="text-default-3">{i18n.t('please select')}</span>
            )}
            <ErdaIcon type="caret-down" className="ml-0.5" size="14" />
          </div>
        );
      }}
    />
  );

  const checkEdit = (func: Function) => {
    if (editing) {
      Modal.confirm({
        title: i18n.t('dop:The current application parameters have changed. Do you want to give up the modification?'),
        onOk() {
          func();
          setEditing(false);
        },
      });
    } else {
      func();
    }
  };

  return (
    <div className="project-deploy-config flex flex-col h-full">
      <RadioTabs
        value={env}
        key={env}
        onChange={(v) =>
          checkEdit(() => goTo(goTo.pages.projectDeployConfigEnv, { projectId, env: `${v}`?.toLowerCase() }))
        }
        options={map(CONFIG_ENV_MAP, (v, k) => ({ label: v, value: k }))}
      />
      <Config
        key={`${env}-${selectedApp?.id}`}
        slot={AppSelectorSlot}
        selectedApp={selectedApp}
        onEditChange={(v) => setEditing(v)}
      />
    </div>
  );
};

const Config = ({
  slot,
  selectedApp,
  onEditChange,
}: {
  slot: React.ReactElement;
  selectedApp: IApplication | null;
  onEditChange: (v: boolean) => void;
}) => {
  const { env: routeEnv } = routeInfoStore.useStore((s) => s.params);
  const env = routeEnv?.toUpperCase();
  const [{ selectedEnv, selectedType, editing }, updater, update] = useUpdate<IState>({
    selectedEnv: env,
    selectedType: 'text',
    editing: false,
  });
  const fullConfigs = configStore.useStore((s) => s.fullConfigs);
  useUnmount(() => {
    configStore.clearConfigs();
  });
  const configNamespace = React.useMemo(
    () => selectedApp?.workspaces.find((w) => w.workspace === selectedEnv)?.configNamespace,
    [selectedApp, selectedEnv],
  );

  const checkEdit = (func: Function) => {
    if (editing) {
      Modal.confirm({
        title: i18n.t('dop:The current application parameters have changed. Do you want to give up the modification?'),
        onOk() {
          func();
          updater.editing(false);
        },
      });
    } else {
      func();
    }
  };

  React.useEffect(() => {
    onEditChange(editing);
  }, [editing]);

  React.useEffect(() => {
    if (selectedApp) {
      const namespaceParams = [
        {
          namespace_name: configNamespace || '',
          decrypt: false,
        },
      ];
      configStore.getConfigs({ namespace: namespaceParams, appID: `${selectedApp.id}` }, 'configmanage');
    }
  }, [selectedApp, selectedEnv, configNamespace]);

  const configData = React.useMemo(
    () =>
      configNamespace
        ? map(
            fullConfigs[configNamespace]?.filter((item) =>
              selectedType === 'text' ? item.type === ConfigTypeMap.kv.key : item.type !== ConfigTypeMap.kv.key,
            ),
            (item) => ({ ...item, namespace: configNamespace, appID: `${selectedApp?.id}` }),
          )
        : [],
    [configNamespace, fullConfigs, selectedApp, selectedType],
  );

  return (
    <div className="bg-white px-4 py-3 rounded-sm mt-2 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center pb-2">
        {slot}
        <div className="w-px h-3 bg-default-1 mr-4" />
        <SimpleTabs
          tabs={map(ConfigTabs, (item) => ({ key: item.key, text: item.text }))}
          value={selectedType}
          onSelect={(v) => checkEdit(() => updater.selectedType(v))}
        />
      </div>
      {selectedApp && configNamespace ? (
        selectedType === 'text' ? (
          <TextConfig
            className="flex-1"
            fullConfigData={fullConfigs[configNamespace]}
            configData={configData}
            onEditChange={(isEdit) => {
              updater.editing(isEdit);
            }}
            addConfig={(data) =>
              configStore.addConfigs(
                {
                  query: { namespace_name: configNamespace, encrypt: data.encrypt, appID: `${selectedApp.id}` },
                  configs: [data],
                },
                'configmanage',
              )
            }
            updateConfig={(data) =>
              configStore.updateConfigs(
                {
                  query: { namespace_name: configNamespace, encrypt: data.encrypt, appID: `${selectedApp.id}` },
                  configs: Array.isArray(data) ? data : [data],
                  batch: Array.isArray(data),
                },
                'configmanage',
              )
            }
            deleteConfig={(data) =>
              configStore.removeConfigWithoutDeploy(
                {
                  key: data.key,
                  namespace_name: configNamespace,
                  appID: `${selectedApp.id}`,
                },
                'configmanage',
              )
            }
          />
        ) : (
          <OtherConfig
            className="flex-1 overflow-auto"
            key={`${selectedEnv}-${selectedApp?.id}`}
            configData={configData}
            fullConfigData={fullConfigs[configNamespace]}
            addConfig={(data) =>
              configStore.addConfigs(
                {
                  query: { namespace_name: configNamespace, encrypt: data.encrypt, appID: `${selectedApp.id}` },
                  configs: [data],
                },
                'configmanage',
              )
            }
            deleteConfig={(data) =>
              configStore.removeConfigWithoutDeploy(
                {
                  key: data.key,
                  namespace_name: configNamespace,
                  appID: `${selectedApp.id}`,
                },
                'configmanage',
              )
            }
          />
        )
      ) : null}
    </div>
  );
};

interface IOtherProps {
  className?: string;
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  configData: PIPELINE_CONFIG.ConfigItem[];
  addConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
}
const OtherConfig = (props: IOtherProps) => {
  const { configData, deleteConfig, addConfig, className = '', fullConfigData } = props;
  const [addVisble, setAddVisible] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const columns = [
    { title: 'Key', dataIndex: 'key' },
    {
      title: i18n.t('type'),
      dataIndex: 'type',
      render: (val: string) => {
        return ConfigTypeMap[val]?.text || '-';
      },
    },
    { title: i18n.t('dop:remark'), dataIndex: 'comment' },
  ];
  const actions = {
    render: (record: PIPELINE_CONFIG.ConfigItem) => {
      const { encrypt, operations } = record;
      const { canDelete, canDownload, canEdit } = operations || {};
      return [
        {
          title: (
            <IF check={canDownload}>
              {encrypt ? (
                <Tooltip title={i18n.t('dop:encrypted files cannot be downloaded')}>
                  <a className="disabled">{i18n.t('download')}</a>
                </Tooltip>
              ) : (
                <a
                  className="text-white-6 hover:text-white"
                  download={record.value}
                  href={`/api/files/${record.value}`}
                >
                  {i18n.t('download')}
                </a>
              )}
            </IF>
          ),
        },
        {
          title: i18n.t('delete'),
          onClick: () => {
            Modal.confirm({
              title: i18n.t('confirm to {action}', { action: i18n.t('delete') }),
              onOk() {
                deleteConfig(record);
              },
            });
          },
          show: canDelete,
        },
      ];
    },
  };
  const useData = searchValue ? configData.filter((item) => item.key.includes(searchValue)) : configData;
  return (
    <div className={`project-other-config ${className}`}>
      <div className="relative">
        <ErdaTable
          slot={
            <Input
              size="small"
              className="w-[200px] bg-black-06 border-none ml-0.5"
              value={searchValue}
              prefix={<ErdaIcon size="16" fill={'default-3'} type="search" />}
              onChange={(e) => {
                const { value } = e.target;
                setSearchValue(value);
              }}
              placeholder={i18n.t('search {name}', { name: 'Key' })}
            />
          }
          rowKey="key"
          columns={columns}
          dataSource={useData}
          actions={actions}
        />
        <Button className="absolute bottom-3 ml-2" onClick={() => setAddVisible(true)}>
          {i18n.t('common:add')}
        </Button>
      </div>
      <VariableConfigForm
        visible={addVisble}
        fullConfigData={fullConfigData}
        addType="file"
        onCancel={() => setAddVisible(false)}
        onOk={(data) => {
          addConfig({ ...data, type: 'dice-file' }).then(() => {
            setAddVisible(false);
          });
        }}
        uploadTip={i18n.t('dop:deploy-upload-file-tip')}
      />
    </div>
  );
};

interface ITextProps {
  className?: string;
  configData: PIPELINE_CONFIG.ConfigItem[];
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  addConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  updateConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  onEditChange?: (isEdit: boolean) => void;
}

const TextConfig = (props: ITextProps) => {
  const {
    configData,
    className = '',
    onEditChange: propsEditChange,
    addConfig,
    deleteConfig,
    updateConfig,
    fullConfigData,
  } = props;
  const [{ editType, editing }, updater, update] = useUpdate({
    editType: 'list',
    editing: false,
  });

  const typeList = [
    {
      icon: 'liebiao',
      tip: i18n.t('common:list view'),
      key: 'list',
    },
    {
      icon: 'daimashitu',
      tip: i18n.t('common:code view'),
      key: 'code',
    },
  ];

  useUpdateEffect(() => {
    propsEditChange?.(editing);
  }, [editing]);

  const checkEdit = (func: Function) => {
    if (editing) {
      Modal.confirm({
        title: i18n.t('dop:The current application parameters have changed. Do you want to give up the modification?'),
        onOk() {
          func();
          updater.editing(false);
        },
      });
    } else {
      func();
    }
  };

  const toggleEditType = (v: string) => {
    checkEdit(() => {
      updater.editType(v);
    });
  };

  const TypeSwitch = (
    <div className="flex-h-center">
      {typeList.map((item, idx) => {
        return (
          <div
            key={item.key}
            className={`p-1 h-[24px] rounded-sm cursor-pointer  ${idx === 0 ? 'rounded-l-sm' : ''} ${
              idx === typeList.length - 1 ? 'rounded-r-sm' : ''
            } ${editType === item.key ? 'bg-purple-deep text-white' : 'bg-default-1'}`}
            onClick={() => toggleEditType(item.key)}
          >
            <Tooltip title={item.tip}>
              <ErdaIcon type={item.icon} size="16" />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
  return (
    <div className={`project-text-config flex flex-col flex-1 overflow-auto ${className}`}>
      {editType === 'list' ? (
        <ListEdit
          configData={configData}
          slot={TypeSwitch}
          fullConfigData={fullConfigData}
          addConfig={addConfig}
          deleteConfig={deleteConfig}
          updateConfig={updateConfig}
          onEditChange={(isEditing) => {
            updater.editing(isEditing);
          }}
        />
      ) : (
        <TextEdit
          fullConfigData={fullConfigData}
          onEditChange={(isEditing) => {
            updater.editing(isEditing);
          }}
          configData={configData}
          slot={TypeSwitch}
          updateConfig={updateConfig}
        />
      )}
    </div>
  );
};

export default ConfigContainer;

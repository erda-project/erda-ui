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
import { ConfigTabs, ConfigTypeMap, CONFIG_ENV_MAP } from './config';
import { VariableConfigForm } from 'application/pages/settings/components/variable-config-form';
import ListEdit from './list-edit';
import TextEdit from './text-edit';
import { firstCharToUpper, goTo } from 'common/utils';
import i18n from 'i18n';
import { appMode } from 'application/common/config';
import routeInfoStore from 'core/stores/route';
import './index.scss';

interface IState {
  selectedType: SelectType;
  editing: boolean;
}

enum SelectType {
  text = 'text',
  other = 'other',
}

export enum ParamsScope {
  pipeline = 'pipeline',
  deploy = 'deploy',
}

interface IProps {
  scope: ParamsScope;
}

const ConfigContainer = (props: IProps) => {
  const { scope } = props;
  const { workspace: routeEnv, projectId } = routeInfoStore.useStore((s) => s.params);

  const [{ selectedApp, editing, namespace, namespaceMap }, updater, update] = useUpdate<{
    selectedApp: IApplication | null;
    editing: boolean;
    namespace: string;
    namespaceMap: PIPELINE_CONFIG.NamespaceItem[];
  }>({
    selectedApp: null,
    editing: false,
    namespace: '',
    namespaceMap: [],
  });

  const env = routeEnv?.toUpperCase();

  useUpdateEffect(() => {
    if (selectedApp) {
      if (scope === ParamsScope.deploy) {
        updater.namespace(selectedApp.workspaces.find((w) => w.workspace === env)?.configNamespace || '');
      } else if (scope === ParamsScope.pipeline) {
        if ([appMode.MOBILE, appMode.LIBRARY].includes(selectedApp.mode)) {
          const mobileNs = map(CONFIG_ENV_MAP, (_, k) => {
            return {
              id: k,
              workspace: k,
              namespace: `app-${selectedApp.id}-${k.toLowerCase()}`,
              decrypt: false,
            };
          });
          updater.namespaceMap(mobileNs);
        } else {
          configStore.getConfigNameSpaces({ appId: `${selectedApp.id}` }).then((res) => {
            updater.namespaceMap(res);
          });
        }
      }
    }
  }, [selectedApp, env]);

  useUpdateEffect(() => {
    if (scope === ParamsScope.pipeline) {
      updater.namespace(
        namespaceMap?.find((item) => (item.workspace || 'default')?.toUpperCase() === env)?.namespace || '',
      );
    }
  }, [env, namespaceMap]);

  const isMobileApp = selectedApp && [appMode.MOBILE, appMode.LIBRARY].includes(selectedApp.mode);

  const configMap = {
    pipeline: {
      jumpTarget: goTo.pages.projectPipelineConfigEnv,
      apiPrefix: 'cicds',
      fileUploadType: isMobileApp ? 'MobileConfig' : 'PipelineConfig',
      uploadTip: selectedApp && !isMobileApp ? i18n.t('dop:upload-file-tip') : '',
    },
    deploy: {
      jumpTarget: goTo.pages.projectDeployConfigEnv,
      apiPrefix: 'configmanage',
      uploadTip: i18n.t('dop:deploy-upload-file-tip'),
      fileUploadType: 'DeployConfig',
    },
  }[scope];

  const AppSelectorSlot = (
    <AppSelector
      autoSelect
      className="project-app-selector"
      value={selectedApp?.id || ''}
      getData={(_q: { pageNo: number; pageSize: number }) => {
        return getJoinedApps({ projectId: +projectId, ..._q }).then((res) => res.data);
      }}
      disabled={editing}
      onClickItem={(app) => {
        update({
          namespace: '',
          selectedApp: app,
        });
      }}
      resultsRender={() => {
        return (
          <div className="w-[160px] h-7 rounded-sm  leading-7 px-2 flex text-default-3 hover:text-default-8">
            {selectedApp ? (
              <Ellipsis className="font-bold text-default" title={selectedApp?.displayName || selectedApp?.name} />
            ) : (
              <span className="text-default-3">{i18n.t('Please Select')}</span>
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
          updater.editing(false);
        },
      });
    } else {
      func();
    }
  };

  return (
    <div className="project-params-config flex flex-col h-full">
      <RadioTabs
        value={env}
        key={env}
        onChange={(v) =>
          checkEdit(() => {
            if (scope === ParamsScope.pipeline) {
              updater.namespace('');
            }
            goTo(configMap.jumpTarget, { projectId, workspace: `${v}`?.toLowerCase() });
          })
        }
        options={map(CONFIG_ENV_MAP, (v, k) => ({ label: v, value: k }))}
      />
      <Config
        key={`${namespace}`}
        slot={AppSelectorSlot}
        namespace={namespace}
        apiPrefix={configMap.apiPrefix}
        selectedApp={selectedApp}
        onEditChange={(v) => updater.editing(v)}
        uploadTip={configMap.uploadTip}
        fileUploadType={configMap.fileUploadType}
      />
    </div>
  );
};

const Config = ({
  slot,
  selectedApp,
  onEditChange,
  apiPrefix,
  uploadTip = '',
  namespace,
  fileUploadType,
}: {
  slot: React.ReactElement;
  selectedApp: IApplication | null;
  onEditChange: (v: boolean) => void;
  uploadTip?: string;
  apiPrefix: string;
  fileUploadType: string;
  namespace?: string;
}) => {
  const { workspace: routeEnv } = routeInfoStore.useStore((s) => s.params);
  const selectedEnv = routeEnv?.toUpperCase();
  const [{ selectedType, editing }, updater, update] = useUpdate<IState>({
    selectedType: SelectType.text,
    editing: false,
  });

  const fullConfigs = configStore.useStore((s) => s.fullConfigs);
  useUnmount(() => {
    configStore.clearConfigs();
  });

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
          namespace_name: namespace || '',
          decrypt: false,
        },
      ];
      namespace && configStore.getConfigs({ namespace: namespaceParams, appID: `${selectedApp.id}` }, apiPrefix);
    }
  }, [selectedApp, namespace, apiPrefix]);

  const configData = React.useMemo(
    () =>
      namespace
        ? map(
            fullConfigs[namespace]?.filter((item) =>
              selectedType === SelectType.text
                ? item.type === ConfigTypeMap.kv.key
                : item.type !== ConfigTypeMap.kv.key,
            ),
            (item) => ({ ...item, namespace, appID: `${selectedApp?.id}` }),
          )
        : [],
    [namespace, fullConfigs, selectedApp, selectedType],
  );

  return (
    <div className="bg-white px-4 py-3 rounded-sm mt-2 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center pb-2">
        {slot}
        <div className="w-px h-3 bg-default-1 mr-4" />
        <SimpleTabs
          tabs={map(ConfigTabs, (item) => ({ key: item.key, text: item.text }))}
          value={selectedType}
          onSelect={(v) => checkEdit(() => updater.selectedType(v as SelectType))}
        />
      </div>
      {selectedApp && namespace ? (
        selectedType === SelectType.text ? (
          <TextConfig
            className="flex-1"
            fullConfigData={fullConfigs[namespace]}
            configData={configData}
            onEditChange={(isEdit) => {
              updater.editing(isEdit);
            }}
            updateConfig={(data) => {
              const [curData, batch] = Array.isArray(data) ? [data, true] : [[data], false];

              configStore.updateConfigs(
                {
                  query: { namespace_name: namespace, encrypt: false, appID: `${selectedApp.id}` },
                  configs: curData,
                  batch,
                },
                apiPrefix,
              );
            }}
            deleteConfig={(data) =>
              configStore.removeConfigWithoutDeploy(
                {
                  key: data.key,
                  namespace_name: namespace,
                  appID: `${selectedApp.id}`,
                },
                apiPrefix,
              )
            }
          />
        ) : (
          <OtherConfig
            className="flex-1 overflow-auto"
            key={`${selectedEnv}-${selectedApp?.id}`}
            configData={configData}
            fileUploadType={fileUploadType}
            fullConfigData={fullConfigs[namespace]}
            uploadTip={uploadTip}
            addConfig={(data) =>
              configStore.addConfigs(
                {
                  query: { namespace_name: namespace, encrypt: data.encrypt, appID: `${selectedApp.id}` },
                  configs: [data],
                },
                apiPrefix,
              )
            }
            deleteConfig={(data) =>
              configStore.removeConfigWithoutDeploy(
                {
                  key: data.key,
                  namespace_name: namespace,
                  appID: `${selectedApp.id}`,
                },
                apiPrefix,
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
  fileUploadType: string;
  uploadTip: string;
  addConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<void>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<void>;
}
const OtherConfig = (props: IOtherProps) => {
  const { configData, deleteConfig, addConfig, className = '', fullConfigData, uploadTip, fileUploadType } = props;
  const [addVisble, setAddVisible] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const columns = [
    { title: 'Key', dataIndex: 'key' },
    {
      title: i18n.t('Type'),
      dataIndex: 'type',
      render: (val: string) => {
        return ConfigTypeMap[val]?.text || '-';
      },
    },
    { title: i18n.t('dop:Remark'), dataIndex: 'comment' },
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
                  <a className="disabled">{i18n.t('Download')}</a>
                </Tooltip>
              ) : (
                <a
                  className="text-white-6 hover:text-white"
                  download={record.value}
                  href={`/api/files/${record.value}`}
                >
                  {i18n.t('Download')}
                </a>
              )}
            </IF>
          ),
        },
        {
          title: i18n.t('Delete'),
          onClick: () => {
            Modal.confirm({
              title: i18n.t('confirm to {action}', { action: i18n.t('Delete') }),
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
              placeholder={firstCharToUpper(i18n.t('search the {name}', { name: 'key' }))}
            />
          }
          rowKey="key"
          columns={columns}
          dataSource={useData}
          actions={actions}
        />
        <Button className="absolute bottom-3 ml-2" onClick={() => setAddVisible(true)}>
          {i18n.t('common:Add')}
        </Button>
      </div>
      <VariableConfigForm
        visible={addVisble}
        configType={fileUploadType}
        fullConfigData={fullConfigData}
        addType="file"
        onCancel={() => setAddVisible(false)}
        onOk={(data) => {
          addConfig({ ...data, type: 'dice-file' }).then(() => {
            setAddVisible(false);
          });
        }}
        uploadTip={uploadTip}
      />
    </div>
  );
};

interface ITextProps {
  className?: string;
  configData: PIPELINE_CONFIG.ConfigItem[];
  fullConfigData: PIPELINE_CONFIG.ConfigItem[];
  updateConfig: (data: PIPELINE_CONFIG.ConfigItem | PIPELINE_CONFIG.ConfigItem[]) => void;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => void;
  onEditChange?: (isEdit: boolean) => void;
}

const TextConfig = (props: ITextProps) => {
  const {
    configData,
    className = '',
    onEditChange: propsEditChange,
    deleteConfig,
    updateConfig,
    fullConfigData,
  } = props;
  const [{ editType, editing }, updater] = useUpdate({
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

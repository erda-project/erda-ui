import * as React from 'react';
import { Drawer, Modal, Tooltip, Input, Button } from 'antd';
import EnvSelect, { envMap } from '../common/env-select';
import { useUpdate } from 'common/use-hooks';
import { ErdaIcon, Ellipsis, IF, SimpleTabs } from 'common';
import ErdaTable from 'common/components/table';
import configStore from 'app/modules/application/stores/pipeline-config';
import { map } from 'lodash';
import { useUnmount, useUpdateEffect } from 'react-use';
import { AppSelector } from 'application/common/app-selector';
import { ConfigTabs, ConfigTypeMap } from '../config';
import { VariableConfigForm } from 'application/pages/settings/components/variable-config-form';
import ListEdit from './list-edit';
import TextEdit from './text-edit';
import i18n from 'i18n';
import './index.scss';

interface IProps {
  visible: boolean;
  onClose: () => void;
  env: string;
}

interface IState {
  selectedApp: IApplication | null;
  selectedEnv: string;
  selectedType: 'text' | 'other';
  editing: boolean;
}

const ConfigDrawer = (props: IProps) => {
  const { visible, onClose, env } = props;
  const [{ selectedApp, selectedEnv, selectedType, editing }, updater, update] = useUpdate<IState>({
    selectedApp: null,
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
        },
      });
    } else {
      func();
    }
  };

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
    <Drawer
      visible={visible}
      width={'80%'}
      onClose={() => {
        checkEdit(() => onClose());
      }}
      title={
        <EnvSelect value={selectedEnv} disabled={editing} onChange={(v) => updater.selectedEnv(v)} required>
          <div className="flex items-center">
            <span>{`${i18n.t('config')} - ${envMap[selectedEnv]}`}</span>
            <ErdaIcon type="caret-down" className="ml-1" size="14" />
          </div>
        </EnvSelect>
      }
    >
      <div className="h-full project-deploy-config flex flex-col">
        <div className="flex items-center mb-2">
          <AppSelector
            autoSelect
            className="project-app-selector"
            value={selectedApp?.id || ''}
            disabled={editing}
            onClickItem={(app) => updater.selectedApp(app)}
            resultsRender={() => {
              return (
                <div className="w-[100px] flex text-default-3 hover:text-default-8">
                  {selectedApp ? (
                    <Ellipsis
                      className="font-bold text-default"
                      title={selectedApp?.displayName || selectedApp?.name}
                    />
                  ) : (
                    <span className="text-default-3">{i18n.t('please select')}</span>
                  )}
                  <ErdaIcon type="caret-down" className="ml-0.5" size="14" />
                </div>
              );
            }}
          />
          <div className="w-[1px] h-[12px] bg-default-1 ml-3 mr-4" />

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
              className="flex-1"
              key={`${selectedEnv}-${selectedApp?.id}`}
              configData={configData}
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
    </Drawer>
  );
};

interface IOtherProps {
  className?: string;
  configData: PIPELINE_CONFIG.ConfigItem[];
  addConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
}
const OtherConfig = (props: IOtherProps) => {
  const { configData, deleteConfig, addConfig, className = '' } = props;
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
      <div className="py-2">
        <Input
          size="small"
          className="w-[200px] bg-black-02"
          value={searchValue}
          bordered={false}
          prefix={<ErdaIcon size="16" fill={'default-3'} type="search" />}
          onChange={(e) => {
            const { value } = e.target;
            setSearchValue(value);
          }}
          placeholder={i18n.t('search by keyword')}
        />
      </div>
      <div className="relative">
        <ErdaTable hideHeader columns={columns} dataSource={useData} actions={actions} />
        <Button className="absolute bottom-3" onClick={() => setAddVisible(true)}>
          {i18n.t('common:add')}
        </Button>
      </div>
      <VariableConfigForm
        visible={addVisble}
        addType="file"
        onCancel={() => setAddVisible(false)}
        onOk={(data) => {
          addConfig(data).then(() => {
            setAddVisible(false);
          });
        }}
      />
    </div>
  );
};

interface ITextProps {
  className?: string;
  configData: PIPELINE_CONFIG.ConfigItem[];
  addConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  updateConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  deleteConfig: (data: PIPELINE_CONFIG.ConfigItem) => Promise<any>;
  onEditChange?: (isEdit: boolean) => void;
}

const TextConfig = (props: ITextProps) => {
  const { configData, className = '', onEditChange: propsEditChange, addConfig, deleteConfig, updateConfig } = props;
  const [{ editType, editing }, updater, update] = useUpdate({
    editType: 'list',
    editing: false,
  });
  const typeList = [
    {
      icon: 'list-view',
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
    <div className={`project-text-config h-full flex-1 overflow-auto ${className}`}>
      {editType === 'list' ? (
        <ListEdit
          configData={configData}
          slot={TypeSwitch}
          addConfig={addConfig}
          deleteConfig={deleteConfig}
          updateConfig={updateConfig}
          onEditChange={(isEditing) => {
            updater.editing(isEditing);
          }}
        />
      ) : (
        <TextEdit
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

export default ConfigDrawer;

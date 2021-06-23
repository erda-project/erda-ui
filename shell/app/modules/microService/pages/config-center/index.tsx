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
import { Input, Table, Dropdown, Tooltip, Button, Modal } from 'app/nusi';
import { ColumnProps } from 'core/common/interface';
import { debounce, isEmpty, get, map, find } from 'lodash';
import { IF, Icon as CustomIcon, Copy } from 'common';
import i18n from 'i18n';
import ConfigFormModal from 'project/common/components/configuration-center/config-form-modal';
import routeInfoStore from 'common/stores/route';
import configCenterStore from 'microService/stores/config-center';
import microServiceStore from 'microService/stores/micro-service';
import { useUnmount } from 'react-use';

import './index.scss';

const { confirm } = Modal;

interface IAppSelectorProps {
  initChoose: string;
  paging: IPaging;
  appList: string[];
  tenantId: string;
  getAppList: (arg: any) => Promise<any>;
  onChange: (arg: any) => void;
}
const AppSelector = (props: IAppSelectorProps) => {
  const { paging, appList = [], getAppList, onChange, tenantId, initChoose } = props;
  const [searchKey, setSearchKey] = React.useState(undefined as string | undefined);
  const [chosenApp, setChosenApp] = React.useState(initChoose);

  const getData = React.useCallback(
    (query: any = {}) => {
      const { searchKey: curKey, ...rest } = query;
      tenantId && getAppList({ ...rest, keyword: curKey, tenantId });
    },
    [getAppList, tenantId],
  );

  React.useEffect(() => {
    tenantId && getData({ pageNo: 1 });
  }, [getData, tenantId]);

  React.useEffect(() => {
    if (!chosenApp && !isEmpty(appList)) {
      setChosenApp(appList[0]);
    }
  }, [chosenApp, appList]);

  const debounceSearch = React.useCallback(
    debounce((val: string | undefined) => {
      getData({ pageNo: 1, searchKey: val });
    }, 200),
    [tenantId],
  );

  React.useEffect(() => {
    debounceSearch(searchKey);
  }, [debounceSearch, searchKey]);

  React.useEffect(() => {
    if (chosenApp) {
      onChange(chosenApp);
    }
  }, [chosenApp, onChange]);

  const nameStyle = `'nowrap ${!chosenApp ? 'p-holder' : ''}`;
  const filterAppList = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchKey(value);
  };
  const handleAppChange = (val: string) => {
    setChosenApp(val);
  };

  const loadMore = (e: any) => {
    e.stopPropagation();
    getData({ searchKey, pageNo: paging.pageNo + 1 });
  };
  const onCloseList = () => {
    setSearchKey(undefined);
  };

  const listComp = (
    <div className="sider-switch-list w-full">
      <div className="input-wrap" onClick={(e) => e.stopPropagation()}>
        <Input placeholder={i18n.t('search')} onChange={filterAppList} value={searchKey} />
      </div>
      <ul>
        {appList.map((item: string) => {
          return (
            <li onClick={() => handleAppChange(item)} className="nowrap" key={item}>
              {item}
            </li>
          );
        })}
        <IF check={paging.hasMore}>
          <li onClick={loadMore}>
            <CustomIcon type="Loading" />
            {i18n.t('common:load more')}
          </li>
        </IF>
      </ul>
    </div>
  );
  return (
    <Dropdown
      overlayClassName="sider-switch-overlay"
      trigger={['click']}
      overlay={listComp}
      onVisibleChange={onCloseList}
    >
      <div className="app-name flex justify-between items-center">
        <span className={nameStyle}>{chosenApp || i18n.t('microService:select application')}</span>
        <CustomIcon className="caret" type="caret-down" />
      </div>
    </Dropdown>
  );
};

interface IConfig {
  key: string;
  value?: string;
  source?: string;
}

const ConfigCenter = () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const msMenuMap = microServiceStore.useStore((s) => s.msMenuMap);
  const [appList, appListPaging, configListMap] = configCenterStore.useStore((s) => [
    s.appList,
    s.appListPaging,
    s.configListMap,
  ]);
  const { getAppList, getConfigList, saveConfig } = configCenterStore.effects;
  const { clearAppList, clearConfigListMap } = configCenterStore.reducers;
  const [chosenApp, setChosenApp] = React.useState('');
  const updateConfigRef = React.useRef(null);
  const addConfigRef = React.useRef(null);
  const { tenantId } = params;
  useUnmount(() => {
    clearAppList();
    clearConfigListMap();
  });

  const getCurConfigList = React.useCallback(
    (query: any = {}) => {
      const tid = query.tenantId || tenantId;
      const cApp = query.chosenApp || chosenApp;
      if (tid && cApp) {
        getConfigList({ tenantId, groupId: chosenApp, ...query });
      }
    },
    [chosenApp, getConfigList, tenantId],
  );

  React.useEffect(() => {
    if (tenantId && chosenApp) {
      getCurConfigList({ tenantId, groupId: chosenApp });
    }
  }, [chosenApp, getCurConfigList, tenantId]);

  const columns: Array<ColumnProps<IConfig>> = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: (a: IConfig, b: IConfig) => a.key.charCodeAt(0) - b.key.charCodeAt(0),
      render: (text) => (
        <div className="flex justify-between items-center">
          <span className="cursor-copy nowrap" data-clipboard-text={text}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (text: string) => (
        <Tooltip title={text} placement="leftTop">
          <span className="cursor-copy" data-clipboard-text={text}>
            {text}
          </span>
        </Tooltip>
      ),
    },
    // {
    //   title: i18n.t('microService:source'),
    //   dataIndex: 'source',
    // },
    {
      title: i18n.t('operation'),
      key: 'operation',
      render: (_text: string, record: IConfig) => {
        const { key, value, source } = record;
        return (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={() => {
                const curRef = updateConfigRef && (updateConfigRef.current as any);
                if (curRef) {
                  curRef.showConfigFormModal({
                    existConfig: { [key]: value },
                  });
                }
              }}
            >
              {i18n.t('common:modify')}
            </span>
            {source === 'DEPLOY' ? null : (
              <span
                className="table-operations-btn"
                onClick={() => {
                  deleteConfirm(record);
                }}
              >
                {i18n.t('common:delete')}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const onChangeApp = (val: string) => {
    setChosenApp(val);
  };
  const getConfigsString = (configs?: any[]) => {
    if (!configs) {
      return '';
    }
    const configArr = configs.map(({ key, value }) => `${key}:${value}`.replace(/({|}|"|\[|\])/g, ''));
    return configArr.join('\r\n');
  };
  const saveCurConfig = (configs: object[], operationType?: string) => {
    saveConfig({ groupId: chosenApp, tenantId, configs, operationType }).then((res) => {
      if (res.success) {
        getCurConfigList();
      }
    });
  };
  const deleteConfirm = (config: IConfig) => {
    confirm({
      title: `${i18n.t('common:confirm to delete configuration')}?`,
      content: `${i18n.t('common:The configuration cannot be restored after deletion. Continue')}?`,
      onOk() {
        const curConfig = configListMap[chosenApp];
        saveCurConfig(
          curConfig.filter((item: any) => item.key !== config.key),
          'delete',
        );
      },
    });
  };
  const updateConfig = (configs: IConfig[]) => {
    const curConfig = configListMap[chosenApp];
    const newConfig = map(curConfig, (item) => {
      const val = get(find(configs, { key: item.key }), 'value');
      return val !== undefined ? { ...item, value: val } : { ...item };
    });
    saveCurConfig(newConfig);
  };
  const addConfig = (configs: IConfig[]) => {
    const newConfig = map(configs, ({ key, value }) => ({ key, value, source: 'DICE' }));
    const curConfig = configListMap[chosenApp];
    saveCurConfig([...newConfig, ...curConfig]);
  };
  return (
    <div className="micro-config-center">
      <AppSelector
        initChoose={get(msMenuMap, 'Configs.params.CONFIGCENTER_GROUP_NAME', '')}
        tenantId={tenantId}
        appList={appList}
        paging={appListPaging}
        getAppList={getAppList}
        onChange={onChangeApp}
      />
      <div className="config-content">
        <div className="extra-items">
          <Button
            type="primary"
            ghost
            onClick={() => {
              const curRef = addConfigRef && (addConfigRef.current as any);
              if (curRef) curRef.showConfigFormModal({ existKeys: map(configListMap[chosenApp], 'key') });
            }}
          >
            {i18n.t('common:add configuration')}
          </Button>
          <span className="cursor-copy" data-clipboard-text={getConfigsString(configListMap[chosenApp] || [])}>
            <Button type="primary" ghost>
              {i18n.t('common:copy configuration')}
            </Button>
          </span>
        </div>
        <Table dataSource={configListMap[chosenApp] || []} columns={columns} />
      </div>
      <Copy selector=".cursor-copy" />
      <ConfigFormModal addConfigs={addConfig} ref={addConfigRef} />
      <ConfigFormModal
        title={i18n.t('common:change setting')}
        keyDisabled
        disableDelete
        isNeedTextArea={false}
        disableAdd
        addConfigs={updateConfig}
        ref={updateConfigRef}
      />
    </div>
  );
};

export default ConfigCenter;

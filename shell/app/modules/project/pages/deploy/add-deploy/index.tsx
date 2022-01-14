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
import { Tooltip } from 'antd';
import { ErdaIcon, DropdownSelectNew, EmptyHolder, SimpleTabs } from 'common';
import ErdaTable from 'common/components/table';
import { map } from 'lodash';
import { ConfigTabs, ConfigTypeMap } from '../config';
import { getReleaseRenderDetail } from 'project/services/deploy';
import routeInfoStore from 'core/stores/route';
import AddRelease from './add-release';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';

const AddDeploy = ({ onSelect: propsOnSelect }: { onSelect: (v: { id: string; releaseId: string }) => void }) => {
  const { env: routeEnv } = routeInfoStore.useStore((s) => s.params);
  const env = routeEnv?.toUpperCase();
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const [selectedApp, setSelectedApp] = React.useState<PROJECT_DEPLOY.IApplicationsInfo | null>(null);
  const [selectedType, setSelectedType] = React.useState('text');

  const [detail] = getReleaseRenderDetail.useState();

  useUpdateEffect(() => {
    selectedRelease &&
      getReleaseRenderDetail.fetch({ releaseID: selectedRelease, workspace: env }).then((res) => {
        res.data?.id && propsOnSelect({ releaseId: selectedRelease, id: res.data?.id });
      });
  }, [selectedRelease, env]);

  React.useEffect(() => {
    setSelectedApp(detail?.applicationsInfo?.[0] || null);
  }, [detail]);

  const onSelect = (r: string) => setSelectedRelease(r);

  const columns = [
    { dataIndex: 'key', title: 'Key' },
    {
      dataIndex: 'value',
      title: 'Value',
      render: (v: string, record: PROJECT_DEPLOY.IAppParams) => (record.encrypt ? '******' : v),
    },
    { dataIndex: 'type', title: i18n.t('type'), render: (v: string) => ConfigTypeMap[v]?.text },
    {
      dataIndex: 'encrypt',
      title: i18n.t('dop:encrypt'),
      render: (v: boolean) => (v ? i18n.t('common:yes') : i18n.t('common:no')),
    },
    { dataIndex: 'comment', title: i18n.t('dop:remark') },
  ];

  const actions = {
    render: (record: PROJECT_DEPLOY.IAppParams) => {
      const { encrypt, type } = record;
      return type === ConfigTypeMap['dice-file'].key
        ? [
            {
              title: (
                <>
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
                </>
              ),
            },
          ]
        : [];
    },
  };

  return (
    <div>
      {detail ? (
        <div className="pb-4 pt-2 text-lg font-medium text-default">{detail.name}</div>
      ) : (
        <div className="pb-4 text-lg font-medium text-default-4">
          {i18n.t(
            'dop:the name of the deployment order is automatically echoed according to the product type, please select the artifact',
          )}
        </div>
      )}
      <div className="flex-h-center ">
        <span>{i18n.t('please select {name}', { name: i18n.t('Artifact') })}</span>
        <div className="w-px h-3 bg-default-1 mx-4" />
        <AddRelease onSelect={onSelect} />
      </div>
      <div className="pt-4">
        <div className="pb-2 text-default font-medium">{i18n.t('dop:application parameters')}</div>
        {detail ? (
          <>
            <div className="flex-h-center">
              <DropdownSelectNew
                options={map(detail?.applicationsInfo, (app) => ({ key: app.id, label: app.name }))}
                optionSize={'small'}
                mode="simple"
                value={selectedApp?.id}
                onClickItem={(v: string) => {
                  setSelectedApp(detail?.applicationsInfo?.find((app) => app.id === v) || null);
                }}
                width={160}
              >
                <div className="flex h-[28px] rounded-sm  bg-default-06 px-2 items-center truncate w-[100px] text-default-3 hover:text-default-8">
                  <span className="truncate text-default font-bold">
                    {selectedApp?.name || i18n.t('please select')}
                  </span>
                  <ErdaIcon type="caret-down" className="ml-1" size="14" />
                </div>
              </DropdownSelectNew>
              <div className="w-px h-3 bg-default-1 ml-3 mr-4" />

              <SimpleTabs
                tabs={map(ConfigTabs, (item) => ({ key: item.key, text: item.text }))}
                value={selectedType}
                onSelect={setSelectedType}
              />
            </div>
            <ErdaTable
              rowKey="id"
              hideReload
              dataSource={(selectedApp?.params || []).filter((item) =>
                selectedType === ConfigTabs.text.key
                  ? item.type === ConfigTypeMap.kv.key
                  : item.type !== ConfigTypeMap.kv.key,
              )}
              columns={columns}
              actions={selectedType === ConfigTabs.text.key ? undefined : actions}
            />
          </>
        ) : (
          <EmptyHolder relative />
        )}
      </div>
    </div>
  );
};

export default AddDeploy;

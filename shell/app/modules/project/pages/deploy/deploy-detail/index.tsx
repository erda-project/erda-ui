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
import { Tooltip, Input } from 'antd';
import { ErdaIcon, FileEditor, DropdownSelectNew, EmptyHolder, Panel, Badge } from 'common';
import ErdaTable from 'common/components/table';
import { map } from 'lodash';
import { useUserMap } from 'core/stores/userMap';
import { ConfigTypeMap, CONFIG_ENV_MAP } from '../config';
import { fromNow, goTo } from 'common/utils';
import DeployLog from 'runtime/common/logs/components/deploy-log';
import FileContainer from 'application/common/components/file-container';
import routeInfoStore from 'core/stores/route';
import moment from 'moment';
import i18n from 'i18n';

interface IProps {
  detail: PROJECT_DEPLOY.DeployDetail | undefined;
}

const DeployDetail = (props: IProps) => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const { detail } = props;
  const userMap = useUserMap();

  const appList = detail?.applicationsInfo;
  const [selectedApp, setSelectedApp] = React.useState<PROJECT_DEPLOY.DeployDetailApp | undefined>(
    appList?.[0] || undefined,
  );

  const [selectedType, setSelectedType] = React.useState('params');

  if (!detail) return null;

  const fields = [
    {
      label: i18n.t('dop:artifact version'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        const curText = value?.version || value?.id || '-';
        return value?.id ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-deep jump-out-link"
            onClick={() => {
              if (value.type === 'application') {
                goTo(goTo.pages.applicationReleaseDetail, { projectId, releaseId: value.id, jumpOut: true });
              } else {
                goTo(goTo.pages.projectReleaseDetail, { projectId, releaseId: value.id, jumpOut: true });
              }
            }}
          >
            {curText}
          </a>
        ) : (
          curText
        );
      },
    },
    {
      label: i18n.t('dop:artifact type'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        const type = value?.type;
        const typeMap = {
          application: <Badge status="success" text={i18n.t('application')} showDot={false} />,
          project: <Badge status="processing" text={i18n.t('project')} showDot={false} />,
        };
        return typeMap[type] || '-';
      },
    },
    {
      label: i18n.t('env'),
      valueKey: 'workspace',
      valueItem: ({ value }: { value: string }) => CONFIG_ENV_MAP[value] || value || '-',
    },
    {
      label: i18n.t('dop:executor'),
      valueKey: 'operator',
      valueItem: ({ value }: { value: string }) => {
        const { nick, name } = userMap[value] || {};
        return nick || name || i18n.t('common:none');
      },
    },
    {
      label: i18n.t('dop:execute time'),
      valueKey: 'startedAt',
      valueItem: ({ value }: { value: string }) => {
        return value ? fromNow(value) : '-';
      },
    },
    {
      label: i18n.t('creator'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        const { nick, name } = userMap[value?.creator] || {};
        return nick || name || i18n.t('common:none');
      },
    },
    {
      label: i18n.t('create time'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        return value?.createdAt ? moment(value.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];

  const tabs = {
    // base: { key: 'base', text: i18n.t('dop:basic information'), Comp: <BaseInfo data={selectedApp} /> },
    params: {
      key: 'params',
      text: i18n.t('dop:parameter information'),
      Comp: <Params data={selectedApp} key={selectedApp?.id} />,
    },
    // log: {
    //   key: 'log',
    //   ...(!selectedApp?.deploymentId ? { disabled: true, tip: i18n.t('common:no data') } : {}),
    //   text: i18n.t('dop:system log'),
    //   Comp: <Log data={selectedApp} />,
    // },
  };

  return (
    <div className="project-deploy-detail  flex flex-col">
      <div className="pb-2 text-default font-medium">{i18n.t('dop:basic information')}</div>
      <Panel fields={fields} data={detail} columnNum={4} />
      <div className="pb-2 pt-4  flex-h-center">
        <span className="text-default font-medium">{i18n.t('application')}</span>
        <span className="bg-default-1 text-default-8 px-2 ml-1 text-xs rounded-lg">{appList?.length || 0}</span>
      </div>
      <div className="p-2">
        <ErdaTable
          rowKey="id"
          columns={[{ title: '', dataIndex: 'name' }]}
          dataSource={appList}
          hideHeader
          showHeader={false}
          pagination={{ hideTotal: true, hidePageSizeChange: true }}
        />
      </div>

      <div className="pb-2 pt-4 text-default font-medium ">{i18n.t('dop:config information')}</div>
      {appList?.length ? (
        <div className="flex flex-col flex-1 h-0 overflow-hidden">
          <DropdownSelectNew
            options={map(appList, (app) => ({ key: app.id, label: app.name }))}
            optionSize={'small'}
            mode="simple"
            value={selectedApp?.id}
            onClickItem={(v: string) => {
              setSelectedType('params');
              setSelectedApp(appList?.find((app) => app.id === v));
            }}
            width={160}
          >
            <div className="flex h-[28px] rounded-sm  items-center px-2 truncate w-[100px] text-default-3 hover:text-default-8 ">
              <span className="truncate text-default font-bold">{selectedApp?.name || i18n.t('please select')}</span>
              <ErdaIcon type="caret-down" className="ml-1" size="14" />
            </div>
          </DropdownSelectNew>
          <div className="mt-3  flex-1 overflow-auto">{tabs[selectedType].Comp || null}</div>
        </div>
      ) : (
        <EmptyHolder relative />
      )}
    </div>
  );
};

interface ISubProps {
  data?: PROJECT_DEPLOY.DeployDetailApp;
}
const BaseInfo = ({ data }: ISubProps) => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);

  const fields = [
    {
      icon: 'version',
      title: i18n.t('dop:artifact version'),
      valueKey: 'releaseVersion',
      render: (val: string, record?: PROJECT_DEPLOY.DeployDetailApp) => {
        const curText = record?.releaseVersion || record?.releaseId || '-';

        return record?.releaseId ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-deep jump-out-link"
            onClick={() =>
              goTo(goTo.pages.applicationReleaseDetail, { projectId, releaseId: record.releaseId, jumpOut: true })
            }
          >
            {curText}
          </a>
        ) : (
          curText
        );
      },
    },
    {
      icon: 'daimafenzhi',
      title: i18n.t('dop:code branch'),
      valueKey: 'branch',
    },
    {
      icon: 'commitID',
      title: 'commitID',
      valueKey: 'commitId',
      render: (val: string, record?: PROJECT_DEPLOY.DeployDetailApp) => {
        const curText = val || '-';

        return val ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-deep jump-out-link"
            onClick={() => goTo(goTo.pages.commit, { projectId, appId: record?.id, commitId: val, jumpOut: true })}
          >
            {curText}
          </a>
        ) : (
          curText
        );
      },
    },
  ];
  const yml = data?.diceYaml || '';
  return (
    <div>
      <InfoRender fields={fields} data={data} />
      <FileContainer className="mt-4" name="dice.yml" showLoading={false}>
        <FileEditor name="dice.yml" fileExtension="yml" value={yml} readOnly />
      </FileContainer>
    </div>
  );
};

const Params = ({ data, slot }: ISubProps) => {
  const [searchValue, setSearchValue] = React.useState('');
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
    { dataIndex: 'comment', title: i18n.t('remark') },
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
  const curData = data?.params || [];
  const useData = searchValue ? curData.filter((item) => item.key.includes(searchValue)) : curData;
  return (
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
      dataSource={useData}
      columns={columns}
      actions={actions}
    />
  );
};

const Log = ({ data }: ISubProps) => {
  if (!data) return null;
  const deployLogProps = {
    detailLogId: data.deploymentId,
    applicationId: data.id,
    hasLogs: false,
  };

  return <DeployLog {...deployLogProps} />;
};

interface InfoRenderProps<T> {
  fields: Array<{ valueKey: string; icon: string; title: string; render?: (v: string, data: T) => React.ReactChild }>;
  data: T;
}
const InfoRender = <T extends unknown>(props: InfoRenderProps<T>) => {
  const { fields, data } = props;
  return (
    <div className="flex-h-center justify-between">
      {fields.map((field, idx) => {
        return (
          <div key={field.valueKey} className={`flex-h-center ${idx === fields.length - 1 ? 'pr-10' : ''}`}>
            <ErdaIcon type={field.icon} className="text-default-4" />
            <span className="text-default-4 ml-1">{field.title}</span>
            <span className="text-default-8 ml-3">
              {field.render?.(data?.[field.valueKey], data) || data?.[field.valueKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DeployDetail;

import * as React from 'react';
import { Tooltip, Avatar } from 'antd';
import { ErdaIcon, FileEditor, DropdownSelectNew, EmptyHolder, SimpleTabs } from 'common';
import ErdaTable from 'common/components/table';
import { map } from 'lodash';
import { useUserMap } from 'core/stores/userMap';
import { ConfigTypeMap } from '../config';
import { fromNow, getAvatarChars, goTo } from 'common/utils';
import DeployLog from 'runtime/common/logs/components/deploy-log';
import FileContainer from 'application/common/components/file-container';
import routeInfoStore from 'core/stores/route';
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

  const [selectedType, setSelectedType] = React.useState('base');

  if (!detail) return null;

  const fields = [
    {
      icon: 'version',
      title: i18n.t('dop:artifact version'),
      valueKey: 'releaseVersion',
      render: (val: string, record: PROJECT_DEPLOY.DeployDetail) => {
        const curText = record.releaseVersion || record.releaseId || '-';

        return record.releaseId ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-deep jump-out-link"
            onClick={() =>
              goTo(goTo.pages.projectReleaseDetail, { projectId, releaseId: record.releaseId, jumpOut: true })
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
      icon: 'zerenren',
      title: i18n.t('dop:executor'),
      valueKey: 'operator',
      render: (value: string) => {
        const { nick, avatar, name } = userMap[value] || {};
        return (
          <div>
            <Avatar src={avatar} size="small">
              {nick ? getAvatarChars(nick) : i18n.t('none')}
            </Avatar>
            <span className="ml-2" title={name}>
              {nick || i18n.t('common:none')}
            </span>
          </div>
        );
      },
    },
    {
      icon: 'shijian-2',
      title: i18n.t('dop:execute time'),
      valueKey: 'startedAt',
      render: (value: string) => {
        return value ? fromNow(value) : '-';
      },
    },
  ];

  const tabs = {
    base: { key: 'base', text: i18n.t('dop:basic information'), Comp: <BaseInfo data={selectedApp} /> },
    params: { key: 'params', text: i18n.t('dop:parameter information'), Comp: <Params data={selectedApp} /> },
    log: { key: 'log', text: i18n.t('dop:system log'), Comp: <Log data={selectedApp} /> },
  };

  return (
    <div className="project-deploy-detail h-full flex flex-col overflow-hidden">
      <div className="pb-2 text-default font-medium">{i18n.t('dop:basic information')}</div>
      <InfoRender fields={fields} data={detail} />
      <div className="pb-2 pt-8 text-default font-medium">{i18n.t('dop:application deployment information')}</div>
      {appList?.length ? (
        <div className="flex flex-col flex-1 h-0 overflow-hidden">
          <div className="flex-h-center">
            <DropdownSelectNew
              options={map(appList, (app) => ({ key: app.id, label: app.name }))}
              optionSize={'small'}
              mode="simple"
              value={selectedApp?.id}
              onClickItem={(v: string) => {
                setSelectedType('base');
                setSelectedApp(appList?.find((app) => app.id === v));
              }}
              width={160}
            >
              <div className="flex items-center truncate w-[100px] text-default-3 hover:text-default-8 ">
                <span className="truncate text-default font-bold">{selectedApp?.name || i18n.t('please select')}</span>
                <ErdaIcon type="caret-down" className="ml-1" size="14" />
              </div>
            </DropdownSelectNew>
            <div className="w-px h-3 bg-default-1 ml-3 mr-4" />
            <SimpleTabs
              tabs={map(tabs, (tab) => ({ key: tab.key, text: tab.text }))}
              onSelect={setSelectedType}
              value={selectedType}
            />
          </div>
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

const Params = ({ data }: ISubProps) => {
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
  return <ErdaTable hideHeader dataSource={data?.params || []} columns={columns} actions={actions} />;
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

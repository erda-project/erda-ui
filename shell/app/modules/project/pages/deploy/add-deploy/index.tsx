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
import { Badge, ErdaIcon, Panel } from 'common';
import ErdaTable from 'common/components/table';
import { useUserMap } from 'core/stores/userMap';
import { CONFIG_ENV_MAP } from '../config';
import { getReleaseRenderDetail } from 'project/services/deploy';
import routeInfoStore from 'core/stores/route';
import { goTo } from 'common/utils';
import AddRelease from './add-release';
import { Tooltip, Checkbox, Spin } from 'antd';
import moment from 'moment';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import { flatten } from 'lodash';

interface Mode {
  expose?: boolean;
  applicationReleaseList: string[];
  key: string;
}

const AddDeploy = ({
  id,
  onSelect: propsOnSelect,
  onModesSelect,
}: {
  id?: string;
  onSelect: (v: { id: string; releaseId: string; name: string; hasFail: boolean }) => void;
  onModesSelect: (v: string[]) => void;
}) => {
  const { workspace: routeEnv, projectId } = routeInfoStore.useStore((s) => s.params);
  const env = routeEnv?.toUpperCase();
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const [modesList, setModeList] = React.useState<Mode[]>([]);
  const [mode, setMode] = React.useState<string[]>([]);

  const userMap = useUserMap();

  const [detail, loading] = getReleaseRenderDetail.useState();

  useUpdateEffect(() => {
    selectedRelease &&
      getReleaseRenderDetail
        .fetch({ releaseID: selectedRelease, workspace: env, mode: mode.join(',') || undefined, id })
        .then((res) => {
          res.data?.id &&
            propsOnSelect({
              name: res.data.name,
              releaseId: selectedRelease,
              id: res.data?.id,
              hasFail: !!flatten(res.data?.applicationsInfo)?.filter((item) => !item?.preCheckResult.success).length,
            });
        });
  }, [selectedRelease, env, mode]);

  const onSelect = (r: PROJECT_DEPLOY.Release) => {
    setSelectedRelease(r.releaseId);

    if (r.modes) {
      const _modes = (JSON.parse(r.modes) || {}) as Mode;
      setModeList(Object.keys(_modes).map((key) => ({ ..._modes[key], key })));
    }
  };

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
        const typeMap = {
          application: <Badge status="success" text={i18n.t('application')} showDot={false} />,
          project: <Badge status="processing" text={i18n.t('project')} showDot={false} />,
        };
        return typeMap[value?.type] || '-';
      },
    },
    {
      label: i18n.t('env'),
      valueKey: 'workspace',
      valueItem: ({ value }: { value: string }) => CONFIG_ENV_MAP[value] || value || '-',
    },

    {
      label: i18n.t('dop:artifact creator'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        const { nick, name } = userMap[value?.creator] || {};
        return nick || name || i18n.t('common:none');
      },
    },
    {
      label: i18n.t('dop:artifact created at'),
      valueKey: 'releaseInfo',
      valueItem: ({ value }: { value: PROJECT_DEPLOY.ReleaseInfo }) => {
        return value?.createdAt ? moment(value.createdAt).format('YYYY/MM/DD HH:mm:ss') : '-';
      },
    },
  ];
  const appList = flatten(detail?.applicationsInfo) || [];

  return (
    <div>
      <div className="flex-h-center ">
        <span className="font-medium">{i18n.t('select {name}', { name: i18n.t('Artifact') })}</span>
        <div className="w-px h-3 bg-default-1 mx-4" />
        <AddRelease onSelect={onSelect} detail={detail} />
      </div>
      {detail ? (
        <div className={`mt-2 p-2`}>
          <div className="pb-2 text-default font-medium">{i18n.t('dop:basic information')}</div>
          <Panel fields={fields} data={detail} columnNum={4} />
          <Spin spinning={loading}>
            <div className="pb-2 pt-4  flex-h-center">
              <span className="text-default font-medium">{i18n.t('mode')}</span>
              <span className="bg-default-1 text-default-8 px-2 ml-1 text-xs rounded-lg">{modesList?.length || 0}</span>
            </div>
            <Checkbox.Group
              options={modesList.map((item) => ({ label: item.key, value: item.key }))}
              value={mode}
              onChange={(v: string[]) => {
                setMode(v);
                onModesSelect(v);
              }}
            />
            <div className="pb-2 pt-4  flex-h-center">
              <span className="text-default font-medium">{i18n.t('application')}</span>
              <span className="bg-default-1 text-default-8 px-2 ml-1 text-xs rounded-lg">{appList?.length || 0}</span>
            </div>
            <div>
              <ErdaTable
                rowKey="id"
                columns={[
                  { dataIndex: 'name' },
                  {
                    dataIndex: ['preCheckResult', 'success'],
                    render: (val: boolean) => {
                      return <ErdaIcon type={val ? 'tongguo' : 'butongguo'} disableCurrent size={18} />;
                    },
                  },
                  {
                    dataIndex: ['preCheckResult', 'failReasons'],
                    render: (val: string[]) => {
                      return val?.length ? (
                        <Tooltip
                          overlayStyle={{ maxWidth: 480 }}
                          placement="right"
                          title={
                            <div className="flex flex-col px-3 py-2">
                              <div className="flex-h-center">
                                <span>{i18n.t('failed reason')}</span>
                                <span className="ml-1 bg-white-1 px-2 text-white-8 text-xs rounded-lg">
                                  {val.length}
                                </span>
                              </div>
                              <div className="text-white-8 flex flex-col">
                                {val?.map((item, idx) => (
                                  <span className="mb-0.5" key={idx}>
                                    {`${idx + 1}、${item}`}
                                  </span>
                                )) || '-'}
                              </div>
                            </div>
                          }
                        >
                          <span className="hover:text-purple-deep">{i18n.t('dop:check failed reason')}</span>
                        </Tooltip>
                      ) : (
                        '-'
                      );
                    },
                  },
                ]}
                dataSource={appList}
                hideHeader
                showHeader={false}
                pagination={{ hideTotal: true, hidePageSizeChange: true }}
              />
            </div>
          </Spin>
        </div>
      ) : null}
    </div>
  );
};

export default AddDeploy;

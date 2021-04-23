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
import { map, isFunction, isEmpty } from 'lodash';
import moment from 'moment';
import { Spin, Table, Badge } from 'app/nusi';
import { Link } from 'react-router-dom';
import { Icon as CustomIcon, Copy, IF } from 'common';
import { goTo } from 'common/utils';
import { PlanName, EnvName, CategoryName } from 'app/modules/addonPlatform/pages/common/configs';
import i18n from 'i18n';

import './detail.scss';

const addonStatusMap = {
  Progressing: <Badge status='processing' text={i18n.t('org:processing')} />,
  Healthy: <Badge status='success' text={i18n.t('healthy')} />,
  UnHealthy: <Badge status='warning' text={i18n.t('unhealthy')} />,
  Failed: <Badge status='error' text={i18n.t('failed')} />,
  Unknown: <Badge status='default' text={i18n.t('unknown')} />,
  Stopped: <Badge status='error' text={i18n.t('stopped')} />,
};

const refTableList = [
  {
    title: i18n.t('org:application'),
    dataIndex: 'applicationName',
    key: 'applicationName',
  },
  {
    title: i18n.t('org:application instance'),
    dataIndex: 'runtimeName',
    key: 'runtimeName',
  },
  {
    title: i18n.t('org:deploy detail page'),
    dataIndex: 'applicationId',
    key: 'applicationId',
    align: 'center' as 'center',
    render: (_text: string, row: { applicationId: number, projectId: number, runtimeId: number }) => {
      const { applicationId, projectId, runtimeId } = row;
      return (
        <Link to={goTo.resolve.runtimeDetailRoot({ projectId, appId: applicationId, runtimeId })}>
          <CustomIcon type="link1" />
        </Link>
      );
    },
  },
];

export const PureBaseAddonInfo = ({
  addonDetail,
  loading,
  extra,
}: {
  addonDetail: Merge<MIDDLEWARE_DASHBOARD.IBaseInfo, {addonStatus?: string}>,
  loading: boolean,
  extra: React.ReactNode
}) => {
  const itemConfigs = [
    {
      title: i18n.t('org:middleware'),
      value: 'addonName',
    },
    {
      title: i18n.t('version'),
      value: 'version',
    },
    {
      title: i18n.t('type'),
      value: 'category',
      render: (category: string) => CategoryName[category],
    },
    {
      title: i18n.t('org:running cluster'),
      value: 'cluster',
    },
    {
      title: i18n.t('org:running environment'),
      value: 'workspace',
      render: (workspace: string) => EnvName[workspace],
    },
    {
      title: i18n.t('dcos:specifications'),
      value: 'plan',
      render: (plan: string) => PlanName[plan],
    },
    {
      title: i18n.t('org:reference count'),
      value: 'referenceInfos',
      render: (referenceInfos: any[] = []) => referenceInfos.length,
    },
    {
      title: i18n.t('create time'),
      value: 'createdAt',
      render: (createdAt: string) => moment(createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  if (addonDetail.isOperator) {
    itemConfigs.push({
      title: i18n.t('status'),
      value: 'addonStatus',
      render: (addonStatus = 'Unknown') => <>{addonStatusMap[addonStatus]}</>,
    });
  }

  const jsonStr = addonDetail.config === null ? '' : JSON.stringify(addonDetail.config, null, 2);

  return (
    <Spin spinning={loading}>
      <div className="addon-detail-page">
        <div className="base-info mb32">
          <span className="title bold-500">{i18n.t('org:basic info')}</span>
          <div className="info-grid">
            {
              map(itemConfigs, ({ title, value, render }) => (
                <div key={title}>
                  <div className="param-k nowrap">{title}</div>
                  <div className="param-v nowrap">
                    {
                      render && isFunction(render)
                        ?
                        render(value ? addonDetail[value] : addonDetail)
                        :
                        addonDetail[value]
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        {
          extra
        }
        <div className="ref mb32">
          <span className="title bold-500">{i18n.t('org:reference detail')}</span>
          <Table columns={refTableList} dataSource={addonDetail.referenceInfos} pagination={false} rowKey="applicationName" />
        </div>
        <div className="config">
          <div className="flex-box">
            <span className="title bold-500">{i18n.t('org:basic parameters')}</span>
            {!isEmpty(addonDetail.config) && <span className="copy-all pointer for-copy">{i18n.t('org:copy all')}<Copy selector=".for-copy" opts={{ text: () => jsonStr }} /></span>}
          </div>
          {
            map(addonDetail.config, (v, k) => (
              <div key={k}>
                <div className="param-k nowrap">{k}</div>
                <IF check={v}>
                  <div className="param-v nowrap">{v}</div>
                  <IF.ELSE />
                  <div className="param-v nowrap">***</div>
                </IF>
              </div>))
          }
        </div>
      </div>
    </Spin>
  );
};

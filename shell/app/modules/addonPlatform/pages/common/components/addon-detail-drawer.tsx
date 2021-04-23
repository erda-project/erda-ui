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
import i18n from 'i18n';
import moment from 'moment';
import { Spin, Drawer, Table } from 'app/nusi';
import { isEmpty, map } from 'lodash';
import { Link } from 'react-router-dom';
import { goTo } from 'common/utils';
import { IF, Copy, Icon as CustomIcon } from 'common';
import { EnvName, PlanName } from 'app/modules/addonPlatform/pages/common/configs';
import { getTranslateAddonName } from 'app/locales/utils';

import './addon-detail-drawer.scss';

interface IProps {
  isFetching: boolean;
  drawerVisible: boolean;
  addonDetail: ADDON.Instance;
  addonReferences: any[];
  closeDrawer(e: any): void;
}


const refTableList = [
  {
    title: i18n.t('application'),
    dataIndex: 'applicationName',
    key: 'applicationName',
  }, {
    title: i18n.t('application instance'),
    dataIndex: 'runtimeName',
    key: 'runtimeName',
  }, {
    title: i18n.t('addonPlatform:deploy detail page'),
    dataIndex: 'applicationId',
    key: 'applicationId',
    align: 'center' as 'center',
    render: (_text: string, row: {applicationId: string, projectId: string, runtimeId: string}) => {
      const { applicationId, projectId, runtimeId } = row;
      return (<Link to={goTo.resolve.runtimeDetailRoot({ applicationId, projectId, runtimeId })}><CustomIcon type="link1" /></Link>);
    },
  },
];

const AddonDetailDrawer = (props: IProps) => {
  const { closeDrawer, drawerVisible, isFetching, addonDetail, addonReferences } = props;
  if (isEmpty(addonDetail)) return null;
  const {
    createdAt,
    reference,
    workspace,
    name,
    addonName,
    projectName,
    plan,
    version,
    config,
    cluster,
  } = addonDetail;

  const instanceData = [
    { key: i18n.t('addon'), value: addonName },
    { key: i18n.t('operating environment'), value: EnvName[workspace] },
    { key: i18n.t('version'), value: version },
    { key: i18n.t('specification'), value: PlanName[plan] },
    { key: i18n.t('project'), value: projectName },
    { key: i18n.t('org:reference counts'), value: reference },
    { key: i18n.t('org:operation cluster'), value: cluster },
    { key: i18n.t('created at'), value: moment(createdAt).format('YYYY-MM-DD HH:mm:ss') },
  // { key: '控制台', value: <a href={consoleUrl} target="_blank" rel="noopener noreferrer">Dubbo Admin</a>, hasValue: !!consoleUrl },
  ];

  const jsonStr = config === null ? '' : JSON.stringify(config, null, 2);

  return (
    <Drawer
      destroyOnClose
        // title="类目录"
      width="600"
      visible={drawerVisible}
      onClose={closeDrawer}
    >
      <Spin spinning={isFetching}>
        <div className="addon-detail">
          <span className="title bold-500">{getTranslateAddonName(name)}</span>
          <div className="info">
            <span className="title bold-500">{i18n.t('basic information')}</span>
            <div className="info-grid">
              {!isEmpty(instanceData) && instanceData.map(({ key, value }) => {
                return (
                  <div key={key}>
                    <div className="param-k nowrap">{key}</div>
                    <div className="param-v nowrap">{value}</div>
                  </div>);
              })}
            </div>
          </div>
          <div className="ref">
            <span className="title bold-500">{i18n.t('org:reference detail')}</span>
            <Table columns={refTableList} dataSource={addonReferences} pagination={false} rowKey="applicationName" />
          </div>
          <div className="config">
            <div className="flex-box">
              <span className="title bold-500">{i18n.t('org:service basic parameters')}</span>
              { !isEmpty(config) && <span className="copy-all pointer for-copy">{i18n.t('copy all')}<Copy selector=".for-copy" opts={{ text: () => jsonStr }} /></span>}
            </div>
            {
                map(config, (v, k) => (
                  typeof v === 'string' &&
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
    </Drawer>
  );
};

export { AddonDetailDrawer };

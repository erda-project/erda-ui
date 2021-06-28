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
import { Table, Badge, Modal, Tooltip } from 'app/nusi';
import { find, get, filter } from 'lodash';
import { useMount } from 'react-use';
import { useUpdate, SearchTable, Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import mspInfoStore from 'app/modules/msp/stores/info';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import httpStore, { IService, IHttpServiceDto } from '../../stores/http';
import { PAGINATION } from 'app/constants';
import mspStore from 'msp/stores/micro-service';
import zkproxyStore from '../../stores/zkproxy';
import { goTo } from 'common/utils';

const { confirm } = Modal;

const HTTPList = () => {
  const columns = [
    {
      title: i18n.t('msp:service name'),
      dataIndex: 'serviceName',
    },
    {
      title: i18n.t('msp:domain'),
      dataIndex: 'serviceDomain',
    },
  ];

  const serviceList = httpStore.useStore((s) => s.serviceList);
  const infoList = mspInfoStore.useStore((s) => s.infoList);
  const clusterName = mspStore.useStore((s) => s.clusterName);
  const { appId, az: qAz } = routeInfoStore.useStore((s) => s.query);
  const { env: workspace, projectId: projectID } = routeInfoStore.useStore((s) => s.params);
  const { getServiceList, toggleIPStatus } = httpStore.effects;
  const { getMSComponentInfo } = mspInfoStore.effects;
  const [loading] = useLoading(httpStore, ['getServiceList']);
  const { getServiceByIp } = zkproxyStore.effects;
  const az = qAz || clusterName;

  const [state, updater] = useUpdate({
    nacosId: '',
    dataSource: [],
  });

  useMount(() => {
    if (az) {
      getMSComponentInfo();
    }
  });

  React.useEffect(() => {
    updater.dataSource(serviceList);
  }, [serviceList, updater]);

  React.useEffect(() => {
    if (state.nacosId && az) {
      getServiceList({ az, appId, nacosId: state.nacosId });
    }
  }, [appId, az, getServiceList, state.nacosId]);

  React.useEffect(() => {
    const info = find(infoList, (item) => item.addonName === 'registercenter');
    if (info && get(info, 'config.NACOS_TENANT_ID')) {
      updater.nacosId(get(info, 'config.NACOS_TENANT_ID'));
    }
  }, [infoList, updater]);

  const jumpToServicePage = (ip: string) => {
    getServiceByIp({ projectID, workspace, ip }).then((res: MS_ZK.IServiceQueryData) => {
      const { appID, runtimeID: runtimeId, serviceName } = res;
      goTo(goTo.pages.runtimeDetail, { jumpOut: true, projectId: projectID, appId: appID, runtimeId, serviceName });
    });
  };

  const expandedRowRender = (record: IService) => {
    const subColumns = [
      {
        title: 'IP',
        dataIndex: 'address',
        render: (ip: string) => (
          <Tooltip title={i18n.t('deployment details')}>
            <span className="hover-active" onClick={() => jumpToServicePage(ip)}>
              {ip}
              <CustomIcon type="link" />
            </span>
          </Tooltip>
        ),
      },
      {
        title: i18n.t('msp:status'),
        dataIndex: 'online',
        render: (value: boolean) => (
          <span>
            <Badge status={value ? 'success' : 'error'} />
            {value ? i18n.t('msp:online') : i18n.t('msp:offline')}
          </span>
        ),
      },
      {
        title: i18n.t('operate'),
        width: 100,
        render: (subRecord: IHttpServiceDto) => {
          return (
            <div className="table-operations">
              <span
                className="table-operations-btn"
                onClick={() => {
                  confirm({
                    title: `${subRecord.online ? i18n.t('confirm to go offline') : i18n.t('confirm to go online')}？`,
                    onOk: () =>
                      toggleIPStatus({
                        az,
                        appId,
                        nacosId: state.nacosId,
                        body: {
                          serviceName: record.serviceName,
                          address: subRecord.address,
                          online: !subRecord.online,
                        },
                      }),
                  });
                }}
              >
                {subRecord.online ? i18n.t('msp:offline') : i18n.t('msp:online')}
              </span>
            </div>
          );
        },
      },
    ];

    return <Table columns={subColumns} dataSource={record.httpServiceDto} pagination={false} rowKey="address" />;
  };

  const onSearch = (searchKey: string) => {
    const filterList = filter(serviceList, (item) => item.serviceName.toLowerCase().includes(searchKey.toLowerCase()));
    updater.dataSource(filterList);
  };

  return (
    <SearchTable onSearch={onSearch} placeholder={i18n.t('msp:search by name')}>
      <Table
        loading={loading}
        columns={columns}
        dataSource={state.dataSource}
        rowKey="serviceName"
        expandedRowRender={expandedRowRender}
        pagination={{
          pageSize: PAGINATION.pageSize,
        }}
      />
    </SearchTable>
  );
};

export default HTTPList;

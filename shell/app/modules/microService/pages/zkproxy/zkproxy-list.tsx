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

import { ColumnProps } from 'antd/lib/table';
import routeInfoStore from 'app/common/stores/route';
import { Holder, SearchTable, Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import { filter, isEmpty, map } from 'lodash';
import { Table, Tooltip } from 'nusi';
import * as React from 'react';
import { useUnmount } from 'react-use';
import zkproxyStore from '../../stores/zkproxy';
import './zkproxy-list.scss';
import microServiceStore from 'microService/stores/micro-service';
import { PAGINATION } from 'app/constants';
import { goTo } from 'common/utils';

const ZkproxyList = () => {
  const [zkInterfaceList] = zkproxyStore.useStore(s => [s.zkInterfaceList]);
  const [currentRoute, routeParams] = routeInfoStore.useStore(s => [s.currentRoute, s.params]);
  const { env: workspace, projectId: projectID } = routeParams;
  const { getZkInterfaceList, getServiceByIp } = zkproxyStore.effects;
  const { setZkInterfaceConfig, clearZkproxyInterfaceList } = zkproxyStore.reducers;

  const [dataSource, setDataSource] = React.useState(zkInterfaceList);
  const az = microServiceStore.getState(s => s.clusterName);

  useUnmount(() => {
    clearZkproxyInterfaceList();
  });

  React.useEffect(() => {
    setDataSource(zkInterfaceList);
    return () => {
      setZkInterfaceConfig({});
    };
  }, [setZkInterfaceConfig, zkInterfaceList]);

  React.useEffect(() => {
    if (az) {
      getZkInterfaceList({ az, runtimeId: currentRoute.routeQuery ? currentRoute.routeQuery.runtimeId : undefined });
    }
  }, [az, currentRoute.routeQuery, getZkInterfaceList]);

  const onSearch = (searchKey: string) => {
    const filterList = filter(zkInterfaceList, item => item.interfacename.toLowerCase().includes(searchKey.toLowerCase()));
    setDataSource(filterList);
  };

  const jumpToServicePage = (ip:string) => {
    getServiceByIp({ projectID, workspace, ip }).then((res:MS_ZK.IServiceQueryData) => {
      const { appID: appId, runtimeID: runtimeId, serviceName } = res;
      goTo(goTo.pages.runtimeDetail, { jumpOut: true, projectId: projectID, appId, runtimeId, serviceName });
    });
  };

  const columns: Array<ColumnProps<MS_ZK.IZkproxy>> = [
    {
      title: i18n.t('microService:interface name'),
      dataIndex: 'interfacename',
    },
    {
      title: i18n.t('microService:supplier list'),
      dataIndex: 'providerlist',
      render: val => (val ? map(val, (item, i) => (
        <div key={`${i}${item}`}>
          {item}
          <Tooltip title={i18n.t('deployment details')}>
            <CustomIcon className="operate-icon hover-active ml8" type="link" onClick={() => jumpToServicePage(item)} />
          </Tooltip>
        </div>)) : ''),
    },
    {
      title: i18n.t('microService:consumer list'),
      dataIndex: 'consumerlist',
      render: val => (val ? map(val, (item, i) => (
        <div key={`${i}${item}`}>
          {item}
          <Tooltip title={i18n.t('deployment details')}>
            <CustomIcon className="operate-icon ml8" type="link" onClick={() => jumpToServicePage(item)} />
          </Tooltip>
        </div>)) : ''),
    },
  ];

  return (
    <Holder when={isEmpty(zkInterfaceList)}>
      <SearchTable onSearch={onSearch} placeholder={i18n.t('microService:filter search by name')}>
        <Table
          className="zkproxy-list"
          columns={columns}
          dataSource={dataSource}
          rowKey="interfacename"
          pagination={{
            pageSize: PAGINATION.pageSize,
          }}
        />
      </SearchTable>
    </Holder>
  );
};

export default ZkproxyList;

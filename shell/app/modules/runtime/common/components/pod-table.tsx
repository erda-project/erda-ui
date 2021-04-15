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
import { Table, Modal } from 'app/nusi';
import i18n from 'i18n';
import moment from 'moment';
import runtimeServiceStore from 'runtime/stores/service';
import { useUpdate } from 'common';

interface IProps {
  runtimeID: number;
  service: string;
}

const PodTable = (props: IProps) => {
  const { runtimeID, service } = props;
  const podListMap = runtimeServiceStore.useStore(s => s.podListMap);
  const podList = podListMap[service] || [];
  const [state, updater] = useUpdate({
    loading: false,
  });

  React.useEffect(() => {
    updater.loading(true);
    runtimeServiceStore.getServicePods({
      runtimeID,
      service,
    }).then(() => {
      updater.loading(false);
    });
  }, [service, runtimeID, updater]);

  const handleKill = (record: RUNTIME_SERVICE.Pod) => {
    const infoContent = (
      <div className="record-info">
        <div>{`${i18n.t('org:pod instance')}: ${record.podName}`}</div>
      </div>
    );

    const onOk = () => runtimeServiceStore.killServicePod({
      runtimeID: +runtimeID,
      podName: record.podName,
    }).then(() => {
      runtimeServiceStore.getServicePods({
        runtimeID,
        service,
      });
    });

    Modal.confirm({
      title: i18n.t('runtime:confirm to kill the pod'),
      content: infoContent,
      width: 500,
      onOk,
    });
  };

  const podTableColumn = [
    {
      title: i18n.t('runtime:pod IP'),
      dataIndex: 'ipAddress',
    },
    {
      title: i18n.t('org:pod instance'),
      dataIndex: 'podName',
    },
    {
      title: i18n.t('runtime:status'),
      dataIndex: 'phase',
    },
    {
      title: i18n.t('org:namespace'),
      dataIndex: 'k8sNamespace',
    },
    {
      title: i18n.t('runtime:Host IP'),
      dataIndex: 'host',
    },
    {
      title: i18n.t('runtime:message content'),
      dataIndex: 'message',
    },
    {
      title: i18n.t('create time'),
      width: 170,
      dataIndex: 'startedAt',
      className: 'th-time nowrap',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('application:operation'),
      dataIndex: 'op',
      width: 60,
      render: (_v: any, record: RUNTIME_SERVICE.Pod) => {
        return (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={() => handleKill(record)}
            >
              {i18n.t('kill')}
            </span>
          </div>
        );
      },
    },
  ];
  return (
    <Table
      loading={state.loading}
      columns={podTableColumn}
      dataSource={podList}
      rowKey="podName"
      tableKey="pod-detail"
      pagination={{
        size: 'small',
        pageSize: 15,
      }}
    />
  );
};

export default PodTable;

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

import { Table, Popover, Button, Badge, Modal } from 'antd';
import i18n from 'i18n';
import moment from 'moment';
import { KeyValueList } from 'common';
import { useUpdate } from 'common/use-hooks';
import React from 'react';
import { goTo } from 'common/utils';

import './mount-list.scss';
import purchaseStore from 'dcos/stores/purchase';
import { useEffectOnce } from 'react-use';

const MountList = () => {
  const { getPurchaseList } = purchaseStore.effects;
  const { clearPurchaseList } = purchaseStore.reducers;
  const purchaseList = purchaseStore.useStore((s) => s.purchaseList);
  const [state, , update] = useUpdate({
    modalVisible: false,
    modalContent: null,
  });
  const toggleModal = (data?: Record<string, any>) => {
    update({
      modalVisible: !state.modalVisible,
      modalContent: data,
    });
  };

  useEffectOnce(() => {
    getPurchaseList();
    return () => {
      clearPurchaseList();
    };
  });
  const { modalVisible, modalContent } = state;

  const clusterList: any[] = [];
  purchaseList.forEach((item) => {
    const { type, info, ...rest } = item;
    if (type === 'cluster') {
      const keys = Object.keys(item.status);
      const obj = rest;
      keys.forEach((k) => {
        if (!obj[k]) {
          obj[k] = {};
        }
        obj[k].status = item.status[k];
        obj[k].info = item.info[k];
        obj[k].error = item.error[k];
      });
      obj.fullInfo = info;
      clusterList.push(obj);
    }
  });
  const columns = [
    ...['ecs', 'nat', 'nas', 'rds', 'redis', 'slb', 'vpc'].map((k) => ({
      title: k,
      dataIndex: k,
      render: (obj: any, record: any) => {
        let detail = <Badge status="processing" text={i18n.t('org:processing')} />;
        if (obj.status === 'Failed') {
          detail = (
            <Popover
              title={i18n.t('org:error detail')}
              placement="bottom"
              overlayClassName="purchase-cluster-popover"
              content={<pre className="code-block">{obj.error}</pre>}
            >
              <Badge status="error" text={i18n.t('failed')} />
            </Popover>
          );
        } else if (obj.status === 'Success' && obj.info) {
          detail = (
            <Popover
              title={i18n.t('configs detail')}
              placement="bottom"
              overlayClassName="purchase-cluster-popover"
              content={<KeyValueList shrink data={obj.info} />}
            >
              <Badge status="success" text={i18n.t('succeed')} />
            </Popover>
          );
        } else if (obj.status === 'Skipped') {
          detail = <Badge status="default" text={i18n.t('skip')} />;
        } else if (Date.now() - record.createdAt > 0.5 * 3600 * 1000) {
          // 超过半小时仍waiting则为超时
          detail = <Badge status="error" text={i18n.t('overtime')} />;
        }
        return detail;
      },
    })),
    {
      title: i18n.t('created at'),
      dataIndex: 'createdAt',
      width: '120',
      render: (text: number) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('operations'),
      width: '60',
      render: (_createdAt: any, record: any) => {
        return <Button onClick={() => toggleModal(record.fullInfo)}>{i18n.t('org:check configs')}</Button>;
      },
    },
  ];
  return (
    <div className="purchase-list-table">
      <Button className="top-button-group" type="primary" onClick={() => goTo('./add')}>
        {i18n.t('add')}
      </Button>
      <Table rowKey="createdAt" pagination={false} columns={columns} dataSource={clusterList} scroll={{ x: '100%' }} />
      <Modal
        title={i18n.t('org:deployment configurations')}
        width={700}
        visible={modalVisible}
        onCancel={() => toggleModal()}
        footer={
          <Button type="primary" onClick={() => toggleModal()}>
            {i18n.t('ok')}
          </Button>
        }
      >
        <KeyValueList shrink data={modalContent} />
      </Modal>
    </div>
  );
};

export default MountList;

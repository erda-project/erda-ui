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

import { Table, Popover, Button, Badge } from 'antd';
import moment from 'moment';
import { KeyValueList } from 'common';
import React from 'react';
import { goTo, connectCube } from 'common/utils';
import AddMachineModal from 'dcos/pages/machine-manager/add-machine-modal';
import { translate } from 'dcos/common/config';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import purchaseStore from 'dcos/stores/purchase';
import machineStore from 'cmp/stores/machine';
import { useLoading } from 'core/stores/loading';

interface IProps {
  purchaseList: any[];
  params: any;
  addMachine: typeof machineStore.effects.addMachine;
  getPurchaseList: typeof purchaseStore.effects.getPurchaseList;
  clearPurchaseList: typeof purchaseStore.reducers.clearPurchaseList;
}

interface IState {
  modalVisible: boolean;
  formData: object | null;
}
class PurchaseList extends React.PureComponent<IProps, IState> {
  state = {
    modalVisible: false,
    formData: null,
  };

  handleSubmit = (data: Record<string, any>) => {
    this.props.addMachine({ ...data, ...{ type: 'private' } });
  };

  toggleModal = (data: object) => {
    this.setState({
      modalVisible: !this.state.modalVisible,
      formData: { ...data },
    });
  };

  componentDidMount(): void {
    this.props.getPurchaseList();
  }

  componentWillUnmount(): void {
    this.props.clearPurchaseList();
  }

  render() {
    const { purchaseList, params } = this.props;
    const { modalVisible, formData } = this.state;

    const dataSource: object[] = [];

    purchaseList.forEach((item) => {
      const { type, status, info, config, error, ...rest } = item;
      if (type !== 'cluster') {
        rest.type = type;
        rest.status = status[type];
        rest.info = info[type];
        rest.translation = {};
        translate(rest.info, rest.translation);
        rest.config = config[type];
        rest.error = error[type];
        dataSource.push(rest);
      }
    });
    const columns = [
      {
        title: i18n.t('type'),
        dataIndex: 'type',
      },
      {
        title: '状态(hover查看详情)',
        dataIndex: 'status',
        render: (status: string, record: any) => {
          let { info, config, translation } = record;
          let detail = <Badge status="processing" text={i18n.t('cmp:processing')} />;
          if (status === 'Failed') {
            detail = (
              <Popover
                title={i18n.t('cmp:error details')}
                placement="bottom"
                overlayClassName="purchase-cluster-popover"
                content={<pre className="code-block">{record.error}</pre>}
              >
                <Badge status="error" text={i18n.t('failed')} />
              </Popover>
            );
          } else if (status === 'Success') {
            if (record.type === 'ecs') {
              [info] = info;
              [config] = config;
              [translation] = translation;
            }
            detail = (
              <Popover
                title={i18n.t('cmp:configuration details')}
                placement="bottom"
                overlayClassName="purchase-cluster-popover"
                content={<KeyValueList shrink data={translation} />}
              >
                <Badge status="success" text={i18n.t('time out')} />
              </Popover>
            );
          } else if (status === 'Skipped') {
            detail = <Badge status="default" text={i18n.t('succeed')} />;
          } else if (Date.now() - record.createdAt > 0.5 * 3600 * 1000) {
            // 超过半小时仍waiting则为超时
            detail = <Badge status="error" text={i18n.t('cmp:jump over')} />;
          }
          return detail;
        },
      },
      {
        title: i18n.t('create time'),
        dataIndex: 'createdAt',
        width: '120',
        render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: i18n.t('operation'),
        width: '60',
        render: (_createdAt: string, record: any) => {
          let { info, config } = record;
          if (record.type !== 'ecs') {
            return null;
          }
          const isSuccess = record.status === 'Success';
          if (isSuccess) {
            [info] = info;
            [config] = config;
          }
          return (
            <Button disabled={!isSuccess} onClick={() => this.toggleModal(record.info)}>
              {i18n.t('cmp:add to cluster')}
            </Button>
          );
        },
      },
    ];

    return (
      <div className="purchase-list-table">
        <Button className="top-button-group mb-3" type="primary" onClick={() => goTo('./add')}>
          {i18n.t('common:add')}
        </Button>
        <Table rowKey="createdAt" pagination={false} columns={columns} dataSource={dataSource} scroll={{ x: '100%' }} />
        <AddMachineModal
          clusterName={params.clusterName}
          modalVisible={modalVisible}
          formData={formData}
          onCancel={this.toggleModal}
          onOk={this.handleSubmit}
        />
      </div>
    );
  }
}

const Mapper = () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const purchaseList = purchaseStore.useStore((s) => s.purchaseList);
  const { getPurchaseList } = purchaseStore.effects;
  const { clearPurchaseList } = purchaseStore.reducers;
  const { addMachine } = machineStore.effects;
  const [isFetching] = useLoading(purchaseStore, ['getPurchaseList']);
  return {
    params,
    purchaseList,
    getPurchaseList,
    clearPurchaseList,
    addMachine,
    isFetching,
  };
};

export default connectCube(PurchaseList, Mapper);

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

import React from 'react';
import { Modal, Tabs, Table } from 'app/nusi';
import { Copy, DetailsPanel, Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import { get, map } from 'lodash';
import { ColumnProps, PaginationProps } from 'core/common/interface';
import apiClientStore from 'apiManagePlatform/stores/api-client';
import { contractStatueMap } from 'apiManagePlatform/pages/client/components/config';
import './index.scss';

interface IProps {
  visible: boolean;
  dataSource: API_CLIENT.ClientItem;
  onCancel(): void;
}

const { TabPane } = Tabs;

const defaultStatue = 'proved';

const DetailModal = ({ visible, onCancel, dataSource }: IProps) => {
  const [showSecret, setShowSecret] = React.useState(false);
  const [
    disprovedContractList,
    disprovedContractPaging,
    provedContractList,
    provedContractPaging,
    provingContractList,
    provingContractPaging,
    unprovedContractList,
    unprovedContractPaging,
  ] = apiClientStore.useStore(s => [
    s.disprovedContractList,
    s.disprovedContractPaging,
    s.provedContractList,
    s.provedContractPaging,
    s.provingContractList,
    s.provingContractPaging,
    s.unprovedContractList,
    s.unprovedContractPaging,
  ]);
  const { getContractList } = apiClientStore.effects;
  const { clearContractList } = apiClientStore.reducers;
  React.useEffect(() => {
    if (visible) {
      getContractList({ status: defaultStatue, paging: true, pageNo: 1, clientID: dataSource.client.id });
    }
    return () => {
      clearContractList();
    };
  }, [clearContractList, dataSource.client.id, getContractList, visible]);
  const dataMap = {
    proved: {
      list: provedContractList,
      paging: provedContractPaging,
    },
    proving: {
      list: provingContractList,
      paging: provingContractPaging,
    },
    disproved: {
      list: disprovedContractList,
      paging: disprovedContractPaging,
    },
    unproved: {
      list: unprovedContractList,
      paging: unprovedContractPaging,
    },
  };
  const handleChangeTab = (activeKey: API_CLIENT.ContractStatue) => {
    if (!dataMap[activeKey].list.length) {
      getContractList({ status: activeKey, paging: true, pageNo: 1, clientID: dataSource.client.id });
    }
  };
  const handleChangeTable = (status: API_CLIENT.ContractStatue, { current, pageSize }: PaginationProps) => {
    getContractList({ status, paging: true, pageNo: current, pageSize, clientID: dataSource.client.id });
  };
  const fields = [{
    label: i18n.t('client name'),
    value: get(dataSource, ['client', 'displayName']) || get(dataSource, ['client', 'name']),
  }, {
    label: i18n.t('description'),
    value: get(dataSource, ['client', 'desc']),
  }, {
    label: 'ClientID',
    value: <span className="for-copy" data-clipboard-text={get(dataSource, ['sk', 'clientID'])}>{get(dataSource, ['sk', 'clientID'])}</span>,
  }, {
    label: 'ClientSecret',
    value: (
      <div className="flex-box client-secret">
        {
          showSecret ? (
            <span className="for-copy" data-clipboard-text={get(dataSource, ['sk', 'clientSecret'])}>{get(dataSource, ['sk', 'clientSecret'])}</span>
          ) : <span>******</span>
        }
        <span className="hover-active ml4" onClick={() => { setShowSecret(!showSecret); }}>
          <CustomIcon type={showSecret ? 'openeye' : 'closeeye'} />
        </span>
      </div>
    ),
  }];
  const columns: Array<ColumnProps<any>> = [{
    title: i18n.t('API name'),
    dataIndex: 'assetName',
  }, {
    title: i18n.t('version'),
    dataIndex: 'swaggerVersion',
  }];
  return (
    <Modal
      title={dataSource.client?.name}
      visible={visible}
      onCancel={onCancel}
      width={960}
      footer={null}
      className="client-info-modal"
      destroyOnClose
    >
      <DetailsPanel
        baseInfoConf={{
          title: i18n.t('basic information'),
          panelProps: {
            fields,
          },
        }}
      />
      <Copy selector=".for-copy" />
      <div className="pa16 api-list">
        <div className="title fz16 color-text bold-500">{i18n.t('authorized API')}</div>
        <Tabs
          defaultActiveKey="proved"
          onChange={(v: string) => { handleChangeTab(v as API_CLIENT.ContractStatue); }}
        >
          {map(contractStatueMap, ({ name, value }) => (
            <TabPane key={value} tab={name}>
              <Table
                columns={columns}
                dataSource={dataMap[value].list}
                pagination={dataMap[value].paging}
                onChange={(pagination) => { handleChangeTable(value, pagination); }}
              />
            </TabPane>
          ))}
        </Tabs>
      </div>
    </Modal>
  );
};
export default DetailModal;

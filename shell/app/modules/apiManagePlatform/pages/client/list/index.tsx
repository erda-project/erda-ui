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
import { Spin, Table, Popconfirm, Input, Modal, Alert } from 'app/nusi';
import { ColumnProps, PaginationProps } from 'core/common/interface';
import i18n from 'i18n';
import apiClientStore from 'apiManagePlatform/stores/api-client';
import { Copy, CustomFilter, TableActions, useUpdate } from 'common';
import { useLoading } from 'common/stores/loading';
import { isEmpty } from 'app/external/custom-lodash';
import { goTo } from 'common/utils';

interface IState {
  keyword: string;
  resetModalInfo: API_CLIENT.ClientSk;
}

const ClientList = () => {
  const [{ keyword, resetModalInfo }, updater] = useUpdate<IState>({
    keyword: '',
    resetModalInfo: {},
  });
  const [clientList, clientListPaging] = apiClientStore.useStore((s) => [s.clientList, s.clientListPaging]);
  const { getClientList, deleteClient, updateClient } = apiClientStore.effects;
  const isLoading = useLoading(apiClientStore, ['getClientList', 'deleteClient', 'updateClient']);
  React.useEffect(() => {
    getClientList({ pageNo: 1, paging: true, keyword });
  }, [getClientList, keyword]);
  const handleTableChange = ({ current: pageNo, pageSize }: PaginationProps) => {
    getClientList({ pageNo, pageSize, paging: true, keyword });
  };
  const handleDelete = (clientID: number) => {
    deleteClient({ clientID }).then(() => {
      getClientList({ pageNo: 1, paging: true, keyword });
    });
  };
  const handleReset = (clientID: number, { name, desc, displayName }: API_CLIENT.Client) => {
    updateClient({ clientID, name, desc, resetClientSecret: true, displayName }).then(({ sk }) => {
      getClientList({ pageNo: clientListPaging.pageNo, paging: true, keyword });
      updater.resetModalInfo(sk);
    });
  };
  const handleSearch = (query: Record<string, any>) => {
    updater.keyword(query.keyword);
  };

  const filterConfig = React.useMemo(
    (): FilterItemConfig[] => [
      {
        type: Input.Search,
        name: 'keyword',
        customProps: {
          placeholder: i18n.t('default:search by keywords'),
          autoComplete: 'off',
        },
      },
    ],
    [],
  );
  const columns: Array<ColumnProps<API_CLIENT.ClientItem>> = [
    {
      title: i18n.t('client name'),
      dataIndex: 'client.displayName',
      render: (text, record) => text || record.client.name,
    },
    {
      title: i18n.t('client identifier'),
      dataIndex: 'client.name',
    },
    {
      title: i18n.t('description'),
      dataIndex: 'client.desc',
    },
    {
      title: i18n.t('operation'),
      dataIndex: 'client.id',
      width: 120,
      render: (text, record) => {
        return (
          <TableActions>
            <Popconfirm
              title={i18n.t('confirm to {action}', { action: i18n.t('reset key') })}
              onConfirm={() => {
                handleReset(text, record.client);
              }}
            >
              <span>{i18n.t('reset key')}</span>
            </Popconfirm>
            <Popconfirm
              title={i18n.t('confirm to {action}', { action: i18n.t('delete') })}
              onConfirm={() => {
                handleDelete(text);
              }}
            >
              <span>{i18n.t('delete')}</span>
            </Popconfirm>
          </TableActions>
        );
      },
    },
  ];
  return (
    <Spin spinning={isLoading.some((t) => t)}>
      <CustomFilter config={filterConfig} onSubmit={handleSearch} />
      <Alert
        message={i18n.t('Data source: API call management')}
        description={i18n.t('On this page, you can check the progress of my application to call the API request, and its specific authentication information after the application is approved.')}
        className="mb8"
      />
      <Table
        rowKey="client.id"
        columns={columns}
        dataSource={clientList}
        onChange={handleTableChange}
        pagination={{
          ...clientListPaging,
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              goTo(`./${record.client.id}`);
            },
          };
        }}
      />
      <Modal
        title={i18n.t('client info')}
        visible={!isEmpty(resetModalInfo)}
        onCancel={() => updater.resetModalInfo({})}
        destroyOnClose
        footer={null}
      >
        <p className="mb4">
          <span className="bold-500">ClientID: </span>
          <span className="for-copy" data-clipboard-text={resetModalInfo.clientID}>
            {resetModalInfo.clientID}
          </span>
        </p>
        <p className="mb4">
          <span className="bold-500">ClientSecret: </span>
          <span className="for-copy" data-clipboard-text={resetModalInfo.clientSecret}>
            {resetModalInfo.clientSecret}
          </span>
        </p>
        <Copy selector=".for-copy" />
      </Modal>
    </Spin>
  );
};

export default ClientList;

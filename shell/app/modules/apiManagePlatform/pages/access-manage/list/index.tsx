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
import { Popconfirm, Spin, Button, Input, Modal } from 'antd';
import Table from 'common/components/table';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import apiAccessStore from 'apiManagePlatform/stores/api-access';
import moment from 'moment';
import { CustomFilter, TableActions } from 'common';
import { goTo } from 'common/utils';
import { useLoading } from 'core/stores/loading';
import { PAGINATION } from 'app/constants';

const formatData = (data: API_ACCESS.AccessListItem[]): API_ACCESS.ITableData[] => {
  return data.map(({ children, ...rest }) => {
    return {
      subData: children.map((child) => ({ ...child, parents: rest })),
      ...rest,
    };
  });
};

const AccessList = () => {
  const [keyword, setKeyword] = React.useState('');
  const [accessList, total] = apiAccessStore.useStore((s) => [s.accessList, s.total]);
  const { getAccess, deleteAccess } = apiAccessStore.effects;
  const { clearAccess } = apiAccessStore.reducers;
  const [isFetch, isDelete] = useLoading(apiAccessStore, ['getAccess', 'deleteAccess']);
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGINATION.pageSize);

  React.useEffect(() => {
    getAccess({ pageNo: 1, paging: true, keyword });
    return () => {
      clearAccess();
    };
  }, [clearAccess, getAccess, keyword]);
  const handleSearch = (query: Record<string, any>) => {
    setKeyword(query.keyword);
  };
  const handleEdit = (record: API_ACCESS.SubAccess) => {
    goTo(`./access/edit/${record.id}`);
  };
  const handleDelete = (record: API_ACCESS.ITableSubAccess) => {
    deleteAccess({ accessID: record.id }).then(() => {
      getAccess({ pageNo: 1, paging: true, keyword });
    });
  };
  const filterConfig = React.useMemo(
    (): FilterItemConfig[] => [
      {
        type: Input,
        name: 'keyword',
        customProps: {
          placeholder: i18n.t('default:search by keywords'),
          autoComplete: 'off',
        },
      },
    ],
    [],
  );
  const columns: Array<ColumnProps<API_ACCESS.ITableData>> = [
    {
      title: i18n.t('API name'),
      dataIndex: 'assetName',
    },
    {
      title: i18n.t('number of versions'),
      dataIndex: 'totalChildren',
      width: 160,
    },
  ];
  const subColumns: Array<ColumnProps<API_ACCESS.ITableSubAccess>> = [
    {
      title: i18n.t('version'),
      dataIndex: 'swaggerVersion',
    },
    {
      title: i18n.t('number of related clients'),
      dataIndex: 'appCount',
      width: 200,
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      width: 176,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const subAcions = {
    render: (record: API_ACCESS.ITableSubAccess) => {
      const { edit, delete: canDelete } = record;
      return [
        {
          title: i18n.t('edit'),
          onClick: () => handleEdit(record),
          show: edit,
        },
        {
          title: i18n.t('delete'),
          onClick: () => {
            Modal.confirm({
              title: i18n.t('confirm to {action}', { action: i18n.t('delete') }),
              onOk() {
                handleDelete(record);
              },
            });
          },
          show: canDelete,
        },
      ];
    },
  };

  const expandedRowRender = (record: API_ACCESS.ITableData) => {
    return (
      <Table
        rowKey="swaggerVersion"
        hideHeader
        columns={subColumns}
        dataSource={record.subData}
        pagination={false}
        actions={subAcions}
        onRow={(data: API_ACCESS.ITableSubAccess) => {
          return {
            onClick: () => {
              goToDetail(data);
            },
          };
        }}
      />
    );
  };
  const goToDetail = (record: API_ACCESS.ITableSubAccess) => {
    goTo(`./detail/${record.id}`);
  };
  const dataSource = formatData(accessList);
  return (
    <Spin spinning={isFetch || isDelete}>
      <div className="top-button-group">
        <Button
          type="primary"
          onClick={() => {
            goTo('./access/create');
          }}
        >
          {i18n.t('establish')}
        </Button>
      </div>
      <Table
        rowKey="assetID"
        columns={columns}
        dataSource={dataSource}
        expandedRowRender={expandedRowRender}
        slot={<CustomFilter config={filterConfig} onSubmit={handleSearch} />}
        pagination={{
          current,
          pageSize,
          total,
        }}
        onChange={({ current: pageNo = current, pageSize: size = pageSize }) => {
          setCurrent(pageNo);
          setPageSize(size);
          getAccess({ pageNo, pageSize: size, paging: true, keyword });
        }}
      />
    </Spin>
  );
};

export default AccessList;

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
import { Modal } from 'antd';
import ErdaTable, { IProps as ITableProps } from 'common/components/table';
import { downloadApi, exportRecord } from 'apiManagePlatform/services/api-export';
import { UserInfo } from 'common';
import i18n from 'i18n';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { useUpdate } from 'common/use-hooks';
import { PAGINATION } from 'app/constants';
import moment from 'moment';
import './export-record.scss';
import { isEmpty } from 'lodash';

interface IProps {
  visible: boolean;
  onCancel: () => void;
}

export const specProtocol = 'csv';

const ExportRecordModal = ({ visible, onCancel }: IProps) => {
  const [data, loading] = exportRecord.useState();
  const [{ pageSize, pageNo }, _updater, update] = useUpdate({
    pageSize: PAGINATION.pageSize,
    pageNo: 1,
  });
  React.useEffect(() => {
    if (visible) {
      exportRecord.fetch({
        pageNo: 1,
        pageSize: PAGINATION.pageSize,
      });
    }
    return () => {
      update({
        pageSize: PAGINATION.pageSize,
        pageNo: 1,
      });
    };
  }, [visible]);
  const columns: ColumnProps<API_MARKET.ExportRecord>[] = [
    {
      title: i18n.t('API name'),
      dataIndex: 'assetName',
    },
    {
      title: i18n.t('version'),
      dataIndex: 'major',
      render: (value: number, record) => {
        return `${value}.${record.minor}.${record.patch}`;
      },
    },
    {
      title: i18n.t('operator'),
      dataIndex: 'creatorID',
      render: (value) => {
        return <UserInfo.RenderWithAvatar id={value} />;
      },
    },
    {
      title: i18n.t('time'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (value) => (value ? moment(value).format('YYYY/MM/DD HH:mm:ss') : '-'),
    },
  ];
  const tableAction: IActions<API_MARKET.ExportRecord> = {
    render: (record) => {
      return [
        {
          title: i18n.t('download'),
          onClick: () => {
            downloadApi.fetch({
              specProtocol,
              versionID: record.versionID,
              assetID: record.assetID,
              $options: {
                isDownload: true,
              },
            });
          },
        },
      ];
    },
  };

  const handleTableChange: ITableProps['onChange'] = ({ current = 1, pageSize: size }, _filters, sorter, extra) => {
    let orderBy;
    if (!isEmpty(sorter) && !Array.isArray(sorter)) {
      orderBy = `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`;
    }
    update({
      pageNo: current,
      pageSize: size,
    });
    exportRecord.fetch({
      pageNo: current,
      pageSize: size,
      orderBy,
    });
  };

  return (
    <Modal
      width={960}
      title={<span className="text-base">{i18n.t('export record')}</span>}
      wrapClassName="export-record-modal"
      visible={visible}
      footer={null}
      destroyOnClose
      onCancel={onCancel}
    >
      <ErdaTable
        wrapperClassName="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        actions={tableAction}
        dataSource={data?.list ?? []}
        pagination={{
          total: data?.total,
          pageSize,
          current: pageNo,
        }}
        onChange={handleTableChange}
      />
    </Modal>
  );
};

export default ExportRecordModal;

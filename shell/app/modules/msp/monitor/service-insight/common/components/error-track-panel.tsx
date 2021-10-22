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
import { Table, Tooltip } from 'antd';
import { get } from 'lodash';
import moment from 'moment';
import { Copy } from 'common';
import siWebStore from '../../stores/web';
import SIDataBaseStore from '../../stores/database';
import { TraceExpandTable, onExpand } from './track-expand-table';
import i18n from 'i18n';

import './slow-track-panel.scss';

interface IErrorTrackProps {
  data: MONITOR_SI.ITableData[];
  query: any;
  timeSpan: ITimeSpan;
  viewLog: (params: any) => void;
  fetchTraceContent: (params: any) => void;
}

export const webErrorTrackPanel = ({ data, query, timeSpan, viewLog, fetchTraceContent }: IErrorTrackProps) => {
  const list = get(data, 'list') || [];
  const { startTimeMs: start, endTimeMs: end } = timeSpan || {};
  const { getSubErrorHttpList } = siWebStore.effects;
  const subErrorHttpList = siWebStore.useStore((s) => s.subErrorHttpList);
  const columns = [
    {
      title: 'Url',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (value: string) => (
        <div className="si-table-adaption">
          <Tooltip title={value}>
            <div className="si-table-value">
              <Copy copyText={value}>{`${value}`}</Copy>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: i18n.t('msp:time'),
      dataIndex: 'time',
      key: 'time',
      width: 200,
      render: (value: string) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('msp:error code'),
      dataIndex: 'httpCode',
      key: 'httpCode',
      width: 140,
    },
    {
      title: i18n.t('msp:number of occurrences'),
      dataIndex: 'count',
      key: 'count',
      width: 80,
    },
  ];

  const expandedRowRender = (record: any) => {
    const { name, httpCode } = record;
    return (
      <TraceExpandTable
        viewLog={viewLog}
        fetchTraceContent={fetchTraceContent}
        recordKey={`${name}_${httpCode}`}
        dataSource={subErrorHttpList}
        emptyText={i18n.t('msp:No abnormal transaction data sampled yet.')}
      />
    );
  };

  const onRowExpand = onExpand(getSubErrorHttpList, query, (record: any) => {
    const { name, httpCode } = record;
    return { start, end, filter_http_path: name, filter_http_status_code: httpCode };
  });

  return (
    <Table
      scroll={{ x: 710 }}
      rowKey={(record: MONITOR_SI.ITableData, i) => i + record.name}
      columns={columns}
      dataSource={list}
      onExpand={onRowExpand}
      expandedRowRender={expandedRowRender}
    />
  );
};

export const dbErrorTrackPanel = ({ data, query, timeSpan, viewLog, fetchTraceContent }: IErrorTrackProps) => {
  const { getSubErrorDbList } = SIDataBaseStore.effects;
  const subErrorDbList = SIDataBaseStore.useStore((s) => s.subErrorDbList);
  const list = get(data, 'list') || [];
  const { startTimeMs: start, endTimeMs: end } = timeSpan || {};

  const columns = [
    {
      title: 'SQL',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (value: string) => (
        <div className="si-table-adaption">
          <Tooltip title={value}>
            <div className="si-table-value">
              <Copy copyText={value}>{`${value}`}</Copy>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: i18n.t('msp:time'),
      dataIndex: 'time',
      key: 'time',
      width: 200,
      render: (value: string) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('msp:number of occurrences'),
      dataIndex: 'count',
      key: 'count',
      width: 80,
    },
  ];

  const expandedRowRender = (record: any) => {
    const { name } = record;
    return (
      <TraceExpandTable
        viewLog={viewLog}
        fetchTraceContent={fetchTraceContent}
        recordKey={name}
        dataSource={subErrorDbList}
        emptyText={i18n.t('msp:No abnormal database data sampled yet.')}
      />
    );
  };

  const onRowExpand = onExpand(getSubErrorDbList, query, (record: any) => {
    const { name } = record;
    return { start, end, filter_error: true, filter_db_statement: name };
  });

  return (
    <Table
      scroll={{ x: 710 }}
      rowKey={(record: MONITOR_SI.ITableData, i) => i + record.name}
      columns={columns}
      dataSource={list}
      onExpand={onRowExpand}
      expandedRowRender={expandedRowRender}
      scroll={{ x: '100%' }}
    />
  );
};

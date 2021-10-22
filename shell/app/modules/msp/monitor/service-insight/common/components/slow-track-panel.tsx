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
import siDataBaseStore from '../../stores/database';
import { TraceExpandTable, onExpand } from './track-expand-table';
import i18n from 'i18n';

import './slow-track-panel.scss';

interface ISlowTrackProps {
  data: MONITOR_SI.ITableData[];
  query: object;
  timeSpan: ITimeSpan;
  viewLog: (params: any) => void;
  fetchTraceContent: (params: any) => void;
  _moduleName: string;
}

export const webSlowTrackPanel = ({
  data,
  query,
  timeSpan,
  viewLog,
  fetchTraceContent,
  _moduleName,
}: ISlowTrackProps) => {
  const { getSubSlowHttpList, getSubSlowRPCList } = siWebStore.effects;
  const [subSlowHttpList, subSlowRpcList] = siWebStore.useStore((s) => [s.subSlowHttpList, s.subSlowRPCList]);
  const list = get(data, 'list') || [];
  const { startTimeMs: start, endTimeMs: end } = timeSpan || {};

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
      title: `${i18n.t('application:maximum time consuming')}(ms)`,
      dataIndex: 'max',
      key: 'max',
      width: 140,
      render: (value: number) => (value / 1000000).toFixed(2),
    },
    {
      title: `${i18n.t('application:minimum time consuming')}(ms)`,
      dataIndex: 'min',
      key: 'min',
      width: 140,
      render: (value: number) => (value / 1000000).toFixed(2),
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
        dataSource={_moduleName === 'SIRPC' ? subSlowRpcList : subSlowHttpList}
        emptyText={i18n.t('msp:No slow transaction data sampled yet.')}
      />
    );
  };

  const getListEffect = _moduleName === 'SIRPC' ? getSubSlowRPCList : getSubSlowHttpList;
  const onRowExpand = onExpand(getListEffect, query, (record: any) => {
    const { name } = record;
    if (_moduleName === 'SIRPC') {
      return { start, end, filter_dubbo_service: name };
    }
    return { start, end, filter_http_path: name };
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

export const dbSlowTrackPanel = ({ data, query, timeSpan, viewLog, fetchTraceContent }: ISlowTrackProps) => {
  const { getSubSlowDbList } = siDataBaseStore.effects;
  const subSlowDbList = siDataBaseStore.useStore((s) => s.subSlowDbList);
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
      title: `${i18n.t('msp:maximum time consuming')}(ms)`,
      dataIndex: 'max',
      key: 'max',
      width: 140,
      render: (value: number) => (value / 1000000).toFixed(2),
    },
    {
      title: `${i18n.t('msp:minimum time consuming')}(ms)`,
      dataIndex: 'min',
      key: 'min',
      width: 140,
      render: (value: number) => (value / 1000000).toFixed(2),
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
        dataSource={subSlowDbList}
        emptyText={i18n.t('msp:No slow database data sampled yet.')}
      />
    );
  };

  const onRowExpand = onExpand(getSubSlowDbList, query, (record: any) => {
    const { name } = record;
    return { start, end, filter_db_statement: name };
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

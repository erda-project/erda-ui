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

import React, { useMemo, useCallback } from 'react';
import { map } from 'lodash';
import { If } from 'tsx-control-statements/components';
import i18n from 'i18n';
import { DC } from '@terminus/dashboard-configurator';
import { Radio, Search, Select, Drawer, Tag, Table } from 'app/nusi';
import { TimeSelector, SimpleLog, useUpdate } from 'common';
import { useLoading } from 'common/stores/loading';
import routeInfoStore from 'app/common/stores/route';
import topologyServiceStore from 'microService/stores/topology-service-analyze';
import TraceSearchDetail from 'microService/monitor/trace-insight/pages/trace-querier/trace-search-detail';
import ServiceListDashboard from './service-list-dashboard';

const { Button: RadioButton, Group: RadioGroup } = Radio;
enum DASHBOARD_TYPE {
  http = 'http',
  rpc = 'rpc',
  cache = 'cache',
  database = 'database'
}
const dashboardIdMap = {
  [DASHBOARD_TYPE.http]: {
    id: 'translation_analysis_http',
    name: i18n.t('microService:HTTP call'),
  },
  [DASHBOARD_TYPE.rpc]: {
    id: 'translation_analysis_rpc',
    name: i18n.t('microService:RPC call'),
  },
  [DASHBOARD_TYPE.cache]: {
    id: 'translation_analysis_cache',
    name: i18n.t('microService:Cache call'),
  },
  [DASHBOARD_TYPE.database]: {
    id: 'translation_analysis_database',
    name: i18n.t('microService:Database call'),
  },
};
const sortList = [
  {
    name: i18n.t('microService:reverse order of number of errors'),
    value: 0,
  },
  {
    name: i18n.t('microService:reverse order of the number of calls'),
    value: 1,
  },
];
// 变量为正则需要转义字符
const REG_CHARS = ['*', '.', '?', '+', '$', '^', '[', ']', '(', ')', '{', '}', '|', '/'];

const Transaction = () => {
  const { getTraceSlowTranslation } = topologyServiceStore;
  const params = routeInfoStore.useStore(s => s.params);
  const [isFetching] = useLoading(topologyServiceStore, ['getTraceSlowTranslation']);
  const [{ type, search, subSearch, sort, url, visible, traceSlowTranslation, detailVisible, traceId, logVisible }, updater] = useUpdate({
    type: DASHBOARD_TYPE.http as DASHBOARD_TYPE,
    search: undefined as string | undefined,
    subSearch: undefined as string | undefined,
    sort: undefined as number | undefined,
    url: undefined as string | undefined,
    traceSlowTranslation: undefined as TOPOLOGY_SERVICE_ANALYZE.TranslationSlowResp | undefined,
    traceId: undefined as string | undefined,
    visible: false as boolean,
    detailVisible: false as boolean,
    logVisible: false as boolean,
  });

  const handleToggleType = (e: any) => {
    updater.type(e.target.value);
    updater.subSearch(undefined);
  };

  const handleBoardEvent = useCallback(({ eventName, cellValue }: DC.BoardEvent) => {
    if (eventName === 'searchTranslation') {
      updater.subSearch(cellValue);
    }
    if (eventName === 'traceSlowTranslation') {
      const { serviceName, terminusKey, serviceId } = params;
      updater.url(cellValue);
      updater.visible(true);
      getTraceSlowTranslation({
        terminusKey,
        serviceName,
        serviceId: window.decodeURIComponent(serviceId),
        operation: cellValue,
      }).then(res => updater.traceSlowTranslation(res));
    }
  }, [getTraceSlowTranslation, params, updater]);

  const [columns, dataSource] = useMemo(() => {
    const c = [
      ...map(traceSlowTranslation?.cols, col => ({
        title: col.title,
        dataIndex: col.index,
      })),
      {
        title: i18n.t('common:operation'),
        dataIndex: 'operation',
        width: 180,
        render: (_: any, record: any) => (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={() => {
                updater.traceId(record.requestId);
                updater.logVisible(true);
              }}
            >
              {i18n.t('check log')}
            </span>
            <span
              className="table-operations-btn"
              onClick={() => {
                updater.traceId(record.requestId);
                updater.detailVisible(true);
              }}
            >
              {i18n.t('check detail')}
            </span>
          </div>
        ),
      },
    ];

    return [c, traceSlowTranslation?.data];
  }, [traceSlowTranslation, updater]);

  const extraGlobalVariable = useMemo(() => {
    let _subSearch = subSearch || search;
    // 动态注入正则查询变量需要转义字符
    _subSearch && REG_CHARS.forEach(char => {
      _subSearch = _subSearch?.replaceAll(char, `\\${char}`);
    });

    return {
      search,
      sort,
      subSearch: _subSearch || undefined,
    };
  }, [search, sort, subSearch]);

  return (
    <div className="service-analyze">
      <div className="flex-box flex-wrap mb4">
        <div className="left flex-box mb8">
          <TimeSelector className="ma0" />
          <If condition={type === DASHBOARD_TYPE.http || type === DASHBOARD_TYPE.rpc}>
            <Select
              className="ml12"
              placeholder={i18n.t('microService:select sort by')}
              allowClear
              style={{ width: '180px' }}
              onChange={(v) => updater.sort(v === undefined ? undefined : Number(v))}
            >
              {sortList.map(({ name, value }) => <Select.Option key={value} value={value}>{name}</Select.Option>)}
            </Select>
          </If>
          <Search
            allowClear
            placeholder={i18n.t('microService:search by transaction name')}
            style={{ marginLeft: '12px', width: '180px' }}
            onHandleSearch={(v) => updater.search(v)}
          />
        </div>
        <div className="right flex-box mb8">
          <RadioGroup
            value={type}
            onChange={handleToggleType}
          >
            {map(dashboardIdMap, (v, k) => <RadioButton key={k} value={k}>{v.name}</RadioButton>)}
          </RadioGroup>
        </div>
      </div>
      <If condition={!!subSearch}>
        <Tag className="mb8" closable onClose={() => updater.subSearch(undefined)}>{subSearch}</Tag>
      </If>
      <ServiceListDashboard
        dashboardId={dashboardIdMap[type].id}
        extraGlobalVariable={extraGlobalVariable}
        onBoardEvent={handleBoardEvent}
      />
      <Drawer
        title={`${i18n.t('microService:tracking details')}-${url}`}
        width="55%"
        visible={visible}
        onClose={() => updater.visible(false)}
      >
        <Table
          loading={isFetching}
          rowKey="requestId"
          columns={columns}
          dataSource={dataSource}
        />
        <Drawer
          destroyOnClose
          title={i18n.t('runtime:monitor log')}
          width="50%"
          visible={logVisible}
          onClose={() => updater.logVisible(false)}
        >
          <SimpleLog requestId={traceId} applicationId={params?.applicationId} />
        </Drawer>
        <Drawer
          title={i18n.t('microService:link information')}
          visible={detailVisible}
          onClose={() => updater.detailVisible(false)}
          width="50%"
          destroyOnClose
        >
          <TraceSearchDetail traceId={traceId} />
        </Drawer>
      </Drawer>
    </div>
  );
};

export default Transaction;

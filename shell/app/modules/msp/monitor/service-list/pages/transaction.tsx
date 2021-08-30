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
import i18n from 'i18n';
import DC from '@erda-ui/dashboard-configurator/dist';
import { Radio, Search, Select, Drawer, Tag, Table } from 'core/nusi';
import { SimpleLog, useUpdate } from 'common';
import monitorCommonStore from 'common/stores/monitorCommon';
import { useLoading } from 'core/stores/loading';
import routeInfoStore from 'core/stores/route';
import topologyServiceStore from 'msp/stores/topology-service-analyze';
import TraceSearchDetail from 'msp/monitor/trace-insight/pages/trace-querier/trace-search-detail';
import ServiceListDashboard from './service-list-dashboard';
import { RadioChangeEvent } from 'core/common/interface';
import { TimeSelectWithStore } from 'msp/components/time-select';

const { Button: RadioButton, Group: RadioGroup } = Radio;
enum DASHBOARD_TYPE {
  http = 'http',
  rpc = 'rpc',
  cache = 'cache',
  database = 'database',
}

type SORT_TYPE = 'DESC' | 'ASC';

const sortButtonMap: { [key in SORT_TYPE]: string } = {
  ASC: i18n.t('msp:time ascending'),
  DESC: i18n.t('msp:time desc'),
};

const dashboardIdMap = {
  [DASHBOARD_TYPE.http]: {
    id: 'translation_analysis_http',
    name: i18n.t('msp:HTTP call'),
  },
  [DASHBOARD_TYPE.rpc]: {
    id: 'translation_analysis_rpc',
    name: i18n.t('msp:RPC call'),
  },
  [DASHBOARD_TYPE.cache]: {
    id: 'translation_analysis_cache',
    name: i18n.t('msp:Cache call'),
  },
  [DASHBOARD_TYPE.database]: {
    id: 'translation_analysis_database',
    name: i18n.t('msp:Database call'),
  },
};
const sortList = [
  {
    name: i18n.t('msp:the number of errors in reverse order'),
    value: 0,
  },
  {
    name: i18n.t('msp:the number of calls in reverse order'),
    value: 1,
  },
];
// 变量为正则需要转义字符
const REG_CHARS = ['*', '.', '?', '+', '$', '^', '[', ']', '(', ')', '{', '}', '|', '/'];

const Transaction = () => {
  const { getTraceSlowTranslation } = topologyServiceStore;
  const { startTimeMs, endTimeMs } = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const params = routeInfoStore.useStore((s) => s.params);
  const [isFetching] = useLoading(topologyServiceStore, ['getTraceSlowTranslation']);
  const [
    { type, search, subSearch, sort, url, visible, traceSlowTranslation, detailVisible, traceId, logVisible, sortType },
    updater,
  ] = useUpdate({
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
    sortType: 'DESC' as SORT_TYPE,
  });

  const handleToggleType = (e: any) => {
    updater.type(e.target.value);
    updater.subSearch(undefined);
  };

  const queryTraceSlowTranslation = (sort_type: SORT_TYPE, cellValue: string) => {
    const { serviceName, terminusKey, serviceId } = params;
    updater.sortType(sort_type);
    getTraceSlowTranslation({
      sort: sort_type,
      start: startTimeMs,
      end: endTimeMs,
      terminusKey,
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      operation: cellValue,
    }).then((res) => updater.traceSlowTranslation(res));
  };

  const handleChangeSortType = React.useCallback(
    (e: RadioChangeEvent) => {
      queryTraceSlowTranslation(e.target.value as SORT_TYPE, url as string);
    },
    [url],
  );

  const handleBoardEvent = useCallback(
    ({ eventName, cellValue }: DC.BoardEvent) => {
      if (eventName === 'searchTranslation') {
        updater.subSearch(cellValue);
      }
      if (eventName === 'traceSlowTranslation') {
        updater.url(cellValue);
        updater.visible(true);
        queryTraceSlowTranslation('DESC', cellValue);
      }
    },
    [getTraceSlowTranslation, params, updater, startTimeMs, endTimeMs],
  );

  const [columns, dataSource] = useMemo(() => {
    const c = [
      ...map(traceSlowTranslation?.cols, (col) => ({
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
    _subSearch &&
      REG_CHARS.forEach((char) => {
        _subSearch = _subSearch?.replaceAll(char, `\\${char}`);
      });

    return {
      search,
      sort,
      subSearch: _subSearch || undefined,
    };
  }, [search, sort, subSearch]);

  return (
    <div className="service-analyze flex flex-col h-full">
      <div>
        <div className="flex justify-between items-center flex-wrap mb-1">
          <div className="left flex justify-between items-center mb-2">
            <If condition={type === DASHBOARD_TYPE.http || type === DASHBOARD_TYPE.rpc}>
              <Select
                className="ml-3"
                placeholder={i18n.t('msp:select sorting method')}
                allowClear
                style={{ width: '180px' }}
                onChange={(v) => updater.sort(v === undefined ? undefined : Number(v))}
              >
                {sortList.map(({ name, value }) => (
                  <Select.Option key={value} value={value}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </If>
            <Search
              allowClear
              placeholder={i18n.t('msp:search by transaction name')}
              style={{ marginLeft: '12px', width: '180px' }}
              onHandleSearch={(v) => updater.search(v)}
            />
          </div>
          <div className="right flex justify-between items-center mb-2">
            <RadioGroup value={type} onChange={handleToggleType}>
              {map(dashboardIdMap, (v, k) => (
                <RadioButton key={k} value={k}>
                  {v.name}
                </RadioButton>
              ))}
            </RadioGroup>
            <TimeSelectWithStore className="ml-3" />
          </div>
        </div>
        <If condition={!!subSearch}>
          <Tag className="mb-2" closable onClose={() => updater.subSearch(undefined)}>
            {subSearch}
          </Tag>
        </If>
      </div>
      <div className="overflow-auto flex-1">
        <ServiceListDashboard
          dashboardId={dashboardIdMap[type].id}
          extraGlobalVariable={extraGlobalVariable}
          onBoardEvent={handleBoardEvent}
        />
      </div>
      <Drawer
        title={`${i18n.t('msp:tracking details')}(${url})`}
        width="55%"
        visible={visible}
        onClose={() => updater.visible(false)}
      >
        <div className="flex items-center flex-wrap justify-end mb-3">
          <RadioGroup value={sortType} onChange={handleChangeSortType}>
            {map(sortButtonMap, (v, k) => (
              <RadioButton key={k} value={k}>
                {v}
              </RadioButton>
            ))}
          </RadioGroup>
        </div>
        <Table
          loading={isFetching}
          rowKey="requestId"
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: '100%' }}
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
          title={i18n.t('msp:link information')}
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

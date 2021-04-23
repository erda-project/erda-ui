
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

import React, { useMemo } from 'react';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { CustomFilter, useFilter, PureBoardGrid, Copy, useSwitch, useUpdate, TagsColumn } from 'common';
import { getTimeRanges } from 'common/utils';
import { Select, DatePicker, Table, Drawer } from 'app/nusi';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import { getFormatter } from 'charts/utils/formatter';
import { useLoading } from 'app/common/stores/loading';
import monitorCommonStore from 'common/stores/monitorCommon';
import traceStore from '../../../../stores/trace';
import TraceSearchDetail from './trace-search-detail';
import { customTagColor } from 'dcos/common/config';

const { RangePicker } = DatePicker;
const { Option } = Select;

const limits = [10, 20, 50, 100];

export default () => {
  const initialRange = [moment().subtract(1, 'hours'), moment()];
  const [traceCount, traceSummary] = traceStore.useStore(s => [s.traceCount, s.traceSummary]);
  const projectApps = monitorCommonStore.useStore(s => s.projectApps);
  const { getTraceCount, getTraceSummary } = traceStore;
  const { getProjectApps } = monitorCommonStore.effects;
  const { clearProjectApps } = monitorCommonStore.reducers;
  const [loading] = useLoading(traceStore, ['getTraceSummary']);

  const [detailVisible, openDetail, closeDetail] = useSwitch(false);
  const [{ traceId }, updater] = useUpdate({
    traceId: undefined,
  });
  // const services = ['s12', 's23', '3s'];

  useEffectOnce(() => {
    getProjectApps({});
    return () => {
      clearProjectApps();
    };
  });

  const getData = (obj?: any) => {
    const { timeFrom, timeTo, service, limit, appId, status } = obj || {};
    const _status = Number(status);
    const start = (timeFrom && moment(timeFrom).valueOf()) || initialRange[0].valueOf();
    const end = (timeTo && moment(timeTo).valueOf()) || initialRange[1].valueOf();

    getTraceCount({
      start,
      end,
      'filter_fields.applications_ids': appId,
      'filter_fields.services_distinct': service,
      field_gt_errors_sum: _status === 1 ? 0 : undefined,
      field_eq_errors_sum: _status === 0 ? 0 : undefined,
    });
    getTraceSummary({
      start,
      end,
      limit,
      'tag.error': status === undefined ? undefined : !!_status,
      'tag.fields.applications_ids': appId,
      'tag.fields.services_distinct': service,
    });
  };

  const { onSubmit } = useFilter({
    getData,
    initQuery: {
      timeFrom: initialRange[0],
      timeTo: initialRange[1],
    },
  });

  const convertTraceCount = (responseData: any) => {
    if (!responseData) return {};
    const { time, results } = responseData;
    const metricData = get(results, '[0].data[0]["cardinality.tags.trace_id"]');
    if (isEmpty(metricData)) return {};
    const { name, data, unit } = metricData;
    return {
      time,
      metricData: [{
        name,
        data,
        unit,
      }],
    };
  };

  const handleCheckTraceDetail = (e: any, id: string) => {
    e.stopPropagation();
    updater.traceId(id as any);
    openDetail();
  };

  const filterConfig = useMemo(() => (
    [
      {
        type: Select,
        name: 'appId',
        valueType: 'number',
        customProps: {
          placeholder: i18n.t('microService:please select application'),
          options: projectApps.map(({ id, name }) => <Option key={id} value={id}>{name}</Option>),
          allowClear: true,
        },
      },
      // {
      //   type: Select,
      //   name: 'service',
      //   customProps: {
      //     placeholder: i18n.t('microService:please select service'),
      //     options: services.map((service) => <Option key={service} value={service}>{service}</Option>),
      //     allowClear: true,
      //   },
      // },
      {
        type: Select,
        name: 'status',
        valueType: 'number',
        customProps: {
          placeholder: i18n.t('microService:please select status'),
          options: [
            <Option key={1} value={1}>{i18n.t('error')}</Option>,
            <Option key={2} value={0}>{i18n.t('success')}</Option>,
          ],
          allowClear: true,
        },
      },
      {
        type: RangePicker,
        name: 'time',
        valueType: 'range',
        required: true,
        customProps: {
          showTime: true,
          allowClear: false,
          format: 'MM-DD HH:mm',
          style: { width: 'auto' },
          ranges: getTimeRanges(),
        },
      },
      {
        type: Select,
        name: 'limit',
        customProps: {
          placeholder: i18n.t('microService:please select max search num'),
          options: limits.map((limit) => <Option key={limit} value={limit}>{limit}</Option>),
          allowClear: true,
        },
      },
    ]
  ), [projectApps]);

  const layout = useMemo(() => ([
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'monitor-trace-count',
      moved: false,
      static: false,
      view: {
        title: i18n.t('microService:trace count'),
        chartType: 'chart:area',
        hideReload: true,
        staticData: convertTraceCount(traceCount),
        config: {
          optionProps: {
            timeSpan: { seconds: 24 * 3601 },
          },
        },
      },
    },
  ]), [traceCount]);

  const columns = [
    {
      title: i18n.t('microService:trace id'),
      dataIndex: 'trace_id',
      width: 350,
      render: (id: string) => <Copy>{id}</Copy>,
    },
    {
      title: i18n.t('microService:elapsed time'),
      dataIndex: 'elapsed',
      sorter: (a: any, b: any) => a.elapsed - b.elapsed,
      render: (elapsed: number) => getFormatter('TIME', 'ns').format(elapsed),
    },
    {
      title: i18n.t('microService:start time'),
      dataIndex: 'start_time',
      render: (time: number) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('tag'),
      dataIndex: 'labels',
      render: (labels: any[]) => <TagsColumn labels={labels.map((l) => ({ label: l, color: customTagColor[l] }))} />,
    },
    {
      title: i18n.t('common:operation'),
      dataIndex: 'operation',
      width: 180,
      render: (_: any, record: any) => (
        <div className="table-operations">
          <span onClick={e => handleCheckTraceDetail(e, record.trace_id)} className="table-operations-btn">{i18n.t('check detail')}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <CustomFilter
        className="mb16"
        onSubmit={onSubmit}
        config={filterConfig}
        isConnectQuery
      />
      <div className="mb24">
        <PureBoardGrid layout={layout} />
      </div>
      <Table
        loading={loading}
        rowKey="trace_id"
        columns={columns}
        dataSource={traceSummary}
      />
      <Drawer
        title={i18n.t('microService:link information')}
        visible={detailVisible}
        onClose={closeDetail}
        width="50%"
        destroyOnClose
      >
        <TraceSearchDetail traceId={traceId} />
      </Drawer>
    </>
  );
};

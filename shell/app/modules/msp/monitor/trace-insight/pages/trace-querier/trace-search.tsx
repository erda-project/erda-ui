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
import { debounce, get, isEmpty, isNumber } from 'lodash';
import moment, { Moment } from 'moment';
import { PureBoardGrid, Copy, useSwitch, useUpdate, TagsRow } from 'common';
import { getTimeRanges } from 'common/utils';
import { ColumnProps } from 'core/common/interface';
import { Table, Drawer, message } from 'core/nusi';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import { getFormatter } from 'charts/utils/formatter';
import { useLoading } from 'core/stores/loading';
import traceStore from '../../../../stores/trace';
import TraceSearchDetail from './trace-search-detail';
import TraceFilter, { IField } from 'trace-insight/components/trace-filter';
import { getQueryConditions } from 'trace-insight/services/trace-querier';
import { transformDuration } from 'trace-insight/components/duration';

const name = {
  sort: i18n.t('msp:sort method'),
  limit: i18n.t('msp:number of queries'),
  traceStatus: i18n.t('msp:tracking status'),
};

const convertData = (
  data: MONITOR_TRACE.TraceConditions,
): [IField[], { [k in MONITOR_TRACE.IFixedConditionType]: string }] => {
  const { others, ...rest } = data;
  const list: IField[] = [];
  const defaultValue = {};
  Object.keys(rest).forEach((key) => {
    const option = data[key];
    defaultValue[key] = option?.[0]?.value;
    list.push({
      type: 'select',
      fixed: true,
      key,
      label: name[key],
      customProps: {
        placeholder: i18n.t('please select {name}', { name: name[key] }),
        className: 'w-64',
        options: option.map((t) => ({ ...t, label: t.displayName })),
      },
    });
  });
  others?.forEach(({ paramKey, displayName, type }) => {
    list.push({
      type,
      fixed: false,
      key: paramKey,
      label: displayName,
      customProps: {
        placeholder: i18n.t('please enter {name}', { name: displayName }),
        className: 'w-64',
      },
    });
  });
  return [list, defaultValue];
};

interface RecordType {
  id: string;
  duration: number;
  startTime: number;
  services: string[];
}

const initialFilter: IField[] = [
  {
    type: 'rangePicker',
    label: i18n.t('msp:time range'),
    fixed: true,
    key: 'time',
    customProps: {
      className: 'w-64',
      showTime: true,
      allowClear: false,
      format: 'MM-DD HH:mm',
      style: { width: 'auto' },
      ranges: getTimeRanges(),
    },
  },
  {
    type: 'duration',
    label: i18n.t('msp:duration'),
    key: 'duration',
    fixed: true,
    customProps: {
      showTime: true,
      allowClear: false,
      format: 'MM-DD HH:mm',
      style: { width: 'auto' },
      ranges: getTimeRanges(),
    },
  },
];

interface IState {
  filter: IField[];
  traceId?: string;
  defaultQuery: Obj;
}

type IQuery = {
  [k in MONITOR_TRACE.IFixedConditionType]: string;
} & {
  time: [Moment, Moment];
  duration: { timer: number; unit: 'ms' | 's' }[];
} & {
  [k: string]: string;
};

export default () => {
  const initialRange = [moment().subtract(1, 'hours'), moment()];
  const [traceCount, traceSummary] = traceStore.useStore((s) => [s.traceCount, s.traceSummary]);
  const { getTraceCount, getTraceSummary } = traceStore;
  const [loading] = useLoading(traceStore, ['getTraceSummary']);

  const [detailVisible, openDetail, closeDetail] = useSwitch(false);
  const [{ traceId, filter, defaultQuery }, updater, update] = useUpdate<IState>({
    filter: [...initialFilter],
    traceId: undefined,
    defaultQuery: {},
  });

  useEffectOnce(() => {
    getQueryConditions().then((res) => {
      if (res.success) {
        const [list, defaultValue] = convertData(res.data);
        update({
          defaultQuery: {
            ...defaultValue,
            time: initialRange,
          },
          filter: [...initialFilter, ...list],
        });
        getData({
          startTime: initialRange[0].valueOf(),
          endTime: initialRange[1].valueOf(),
          status: defaultValue.traceStatus,
          ...defaultValue,
        });
      }
    });
  });

  const getData = React.useCallback(
    debounce((obj: Omit<MS_MONITOR.ITraceSummaryQuery, 'tenantId'>) => {
      const { startTime, endTime, serviceName, status } = obj;

      getTraceCount({
        start: startTime,
        end: endTime,
        'filter_fields.services_distinct': serviceName,
        field_gt_errors_sum: status === 'trace_error' ? 0 : undefined,
        field_eq_errors_sum: status === 'trace_success' ? 0 : undefined,
      });
      getTraceSummary(obj);
    }, 500),
    [],
  );

  const handleSearch = (query: Partial<IQuery>) => {
    const { time, duration, traceStatus, ...rest } = query;
    const startTime = time?.[0].valueOf() ?? initialRange[0].valueOf();
    const endTime = time?.[1].valueOf() ?? initialRange[1].valueOf();
    const durationMin = transformDuration(duration?.[0]);
    const durationMax = transformDuration(duration?.[1]);
    let durations = {};
    if (isNumber(durationMin) && isNumber(durationMax)) {
      if (durationMin <= durationMax) {
        durations = {
          durationMin,
          durationMax,
        };
      } else {
        message.error(i18n.t('msp:wrong duration'));
      }
    }
    getData({
      startTime,
      endTime,
      status: traceStatus,
      ...durations,
      ...rest,
    });
  };
  const convertTraceCount = (responseData: any) => {
    if (!responseData) return {};
    const { time, results } = responseData;
    const metricData = get(results, '[0].data[0]["cardinality.tags.trace_id"]');
    if (isEmpty(metricData)) return {};
    const { name, data, unit } = metricData;
    return {
      time,
      metricData: [
        {
          name,
          data,
          unit,
        },
      ],
    };
  };

  const handleCheckTraceDetail = (e: any, id: string) => {
    e.stopPropagation();
    updater.traceId(id as any);
    openDetail();
  };

  const layout = useMemo(
    () => [
      {
        w: 24,
        h: 9,
        x: 0,
        y: 0,
        i: 'monitor-trace-count',
        moved: false,
        static: false,
        view: {
          title: i18n.t('msp:trace times'),
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
    ],
    [traceCount],
  );

  const columns: Array<ColumnProps<RecordType>> = [
    {
      title: i18n.t('msp:trace id'),
      dataIndex: 'id',
      render: (id: string) => <Copy>{id}</Copy>,
    },
    {
      title: i18n.t('msp:duration'),
      dataIndex: 'duration',
      width: 240,
      sorter: (a: RecordType, b: RecordType) => a.duration - b.duration,
      render: (duration: number) => getFormatter('TIME', 'ns').format(duration),
    },
    {
      title: i18n.t('msp:start time'),
      dataIndex: 'startTime',
      width: 200,
      render: (time: number) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('service'),
      dataIndex: 'services',
      width: 240,
      render: (services: string[]) => <TagsRow labels={services.map((service) => ({ label: service }))} />,
    },
    {
      title: i18n.t('common:operation'),
      dataIndex: 'operation',
      width: 200,
      fixed: 'right',
      render: (_: any, record: RecordType) => (
        <div className="table-operations">
          <span onClick={(e) => handleCheckTraceDetail(e, record.id)} className="table-operations-btn">
            {i18n.t('check detail')}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <TraceFilter list={filter} initialValues={defaultQuery} onChange={handleSearch} />
      <div className="mb-6">
        <PureBoardGrid layout={layout} />
      </div>
      <Table loading={loading} rowKey="id" columns={columns} dataSource={traceSummary} scroll={{ x: 1100 }} />
      <Drawer
        title={i18n.t('msp:link information')}
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

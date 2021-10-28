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
import { ContractiveFilter, Copy, PureBoardGrid, TagsRow } from 'common';
import { useSwitch, useUpdate } from 'common/use-hooks';
import { ColumnProps } from 'core/common/interface';
import { Table, Drawer, message } from 'antd';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { getFormatter } from 'charts/utils/formatter';
import { useLoading } from 'core/stores/loading';
import traceStore from '../../../../stores/trace';
import TraceSearchDetail from './trace-search-detail';
import { ICondition } from 'common/components/contractive-filter';
import { getQueryConditions } from 'trace-insight/services/trace-querier';
import Duration, { transformDuration } from 'trace-insight/components/duration';
import { TimeSelectWithStore } from 'msp/components/time-select';
import monitorCommonStore from 'common/stores/monitorCommon';
import routeInfoStore from 'core/stores/route';

const name = {
  sort: i18n.t('msp:sort method'),
  limit: i18n.t('msp:number of queries'),
  traceStatus: i18n.t('msp:tracking status'),
};

const convertData = (
  data: MONITOR_TRACE.TraceConditions,
): [any[], { [k in MONITOR_TRACE.IFixedConditionType]: string }] => {
  const { others, ...rest } = data;
  const list: ICondition[] = [];
  const defaultValue = {};
  const fixC = Object.keys(rest);
  fixC.forEach((key, index) => {
    const option = data[key];
    defaultValue[key] = option?.[0]?.value;
    list.push({
      type: 'select',
      fixed: true,
      showIndex: index + 2,
      key,
      label: name[key],
      options: option.map((t) => ({ ...t, label: t.displayName })),
      customProps: {
        mode: 'single',
      },
    });
  });
  others?.forEach(({ paramKey, displayName, type }) => {
    list.push({
      type,
      showIndex: 0,
      fixed: false,
      placeholder: i18n.t('please enter {name}', { name: displayName }),
      key: paramKey,
      label: displayName,
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

const initialFilter = [
  {
    label: i18n.t('msp:duration'),
    key: 'duration',
    showIndex: 1,
    fixed: true,
    getComp: (props) => {
      return <Duration {...props} />;
    },
  },
];

interface IState {
  filter: ICondition[];
  traceId?: string;
  defaultQuery: Obj;
  query: Obj;
}

type IQuery = {
  [k in MONITOR_TRACE.IFixedConditionType]: string;
} & {
  time: [Moment, Moment];
  duration: Array<{ timer: number; unit: 'ms' | 's' }>;
} & {
  [k: string]: string;
};

export default () => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const [traceCount, traceSummary] = traceStore.useStore((s) => [s.traceCount, s.traceSummary]);
  const { getTraceCount, getTraceSummary } = traceStore;
  const [loading] = useLoading(traceStore, ['getTraceSummary']);
  const { setIsShowTraceDetail } = monitorCommonStore.reducers;
  const [detailVisible, openDetail, closeDetail] = useSwitch(false);
  const [{ traceId, filter, defaultQuery, query }, updater, update] = useUpdate<IState>({
    filter: [],
    traceId: undefined,
    defaultQuery: {},
    query: {},
  });
  const routeQuery = routeInfoStore.useStore((s) => s.query);

  useEffectOnce(() => {
    getQueryConditions().then((res) => {
      if (res.success) {
        const [list, defaultValue] = convertData(res.data);
        const handleDefaultValue = {
          ...defaultValue,
          traceStatus: routeQuery?.status || defaultValue.traceStatus,
        };
        update({
          defaultQuery: {
            ...handleDefaultValue,
          },
          query: {
            ...handleDefaultValue,
          },
          filter: [...initialFilter, ...list],
        });
        getData({
          startTime: range.startTimeMs,
          endTime: range.endTimeMs,
          status: defaultValue.traceStatus,
          ...handleDefaultValue,
        });
      }
    });
  });

  useUpdateEffect(() => {
    getData({
      ...query,
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
    });
  }, [query, range]);

  const getData = React.useCallback(
    debounce((obj: Omit<MS_MONITOR.ITraceSummaryQuery, 'tenantId'>) => {
      const { serviceName, status, startTime, endTime } = obj;

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
    const { duration, traceStatus, ...rest } = query;
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
    updater.query({
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
    updater.traceId(id as string);
    setIsShowTraceDetail(true);
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
      title: i18n.t('operation'),
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
      <div className="flex justify-between items-start bg-white px-2 py-2 mb-3">
        <div className="flex-1">
          {filter.length > 0 ? (
            <ContractiveFilter delay={1000} conditions={filter} initValue={defaultQuery} onChange={handleSearch} />
          ) : null}
        </div>
        <TimeSelectWithStore />
      </div>
      <div className="mb-6">
        <PureBoardGrid layout={layout} />
      </div>
      <Table loading={loading} rowKey="id" columns={columns} dataSource={traceSummary} scroll={{ x: 1100 }} />
      <TraceSearchDetail traceId={traceId} />
    </>
  );
};

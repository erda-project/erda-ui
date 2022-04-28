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
import { TimeSelectWithStore } from 'msp/components/time-select';
import { getTraceConditions } from 'msp/monitor/trace-insight/services/trace-querier';
import ContractiveFilter, { ICondition } from 'common/components/contractive-filter';
import Duration, { IValue, transformDuration } from 'common/components/duration';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import DiceConfigPage from 'config-page';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import { isNumber } from 'lodash';
import { message } from 'antd';
import TraceSearchDetail from 'trace-insight/pages/trace-querier/trace-search-detail';
import { useUpdate } from 'common/use-hooks';
import moment from 'moment';

const name = {
  sort: i18n.t('msp:sort method'),
  limit: i18n.t('msp:number of queries'),
  traceStatus: i18n.t('msp:Tracing status'),
};

interface IState {
  traceId?: string;
  startTime?: number;
  query: {
    serviceName?: string;
    rpcMethod?: string;
    durationMin?: string;
    durationMax?: string;
    traceStatus?: string;
    traceID?: string;
    httpPath?: string;
  };
}

interface IProps {
  scope?: 'serviceMonitor' | 'trace';
}

interface ITableRow {
  traceId: {
    data: { text: string };
  };
  traceStartTime: {
    data: { text: string };
  };
}

const TraceSearch: React.FC<IProps> = ({ scope = 'trace' }) => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const [requestCompleted, serviceName] = serviceAnalyticsStore.useStore((s) => [s.requestCompleted, s.serviceName]);
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const { setIsShowTraceDetail } = monitorCommonStore.reducers;
  const conditions = getTraceConditions.useData();
  const [{ traceId, startTime, query }, updater, update] = useUpdate<IState>({
    traceId: undefined,
    query: {},
    startTime: undefined,
  });
  React.useEffect(() => {
    getTraceConditions.fetch();
  }, []);
  const [filter, defaultQuery] = React.useMemo<[ICondition[], Record<string, string>]>(() => {
    const list: ICondition[] = [];
    const defaultValue: Record<string, string> = {};
    if (conditions) {
      const { others, sort, ...rest } = conditions;
      const fixConditions = Object.keys(rest);
      fixConditions.forEach((key, index) => {
        const option = conditions[key];
        defaultValue[key] = option?.[0]?.value;
        list.push({
          type: 'select',
          fixed: true,
          showIndex: index + 2,
          key,
          label: name[key],
          options: option.map((t: SERVICE_ANALYTICS.IConditionItem) => ({
            value: t.value,
            label: t.displayName,
            icon: '',
          })),
          customProps: {
            mode: 'single',
          },
        });
      });
      others
        ?.filter((t) => (scope === 'serviceMonitor' ? t.paramKey !== 'serviceName' : true))
        .forEach(({ paramKey, displayName }) => {
          list.push({
            type: 'input',
            showIndex: 0,
            fixed: false,
            placeholder: i18n.t('Please enter the {name}', { name: displayName }),
            key: paramKey,
            label: displayName,
            customProps: {},
          });
        });
    }
    updater.query(defaultValue);
    return [
      [
        {
          label: i18n.t('msp:Duration'),
          key: 'duration',
          showIndex: 1,
          fixed: true,
          tips: i18n.t('msp:The minimum and maximum values are both required'),
          getComp: (props) => {
            return <Duration {...props} />;
          },
        },
        ...list,
      ] as ICondition[],
      defaultValue,
    ];
  }, [conditions]);

  const handleSearch = (data: {
    [key: string]: string | Array<IValue>;
    duration: Array<IValue>;
    traceStatus: string;
  }) => {
    const { duration, ...rest } = data;
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
      ...durations,
      ...rest,
    });
  };

  const params = React.useMemo(() => {
    const { traceStatus, traceID, ...rest } = query;
    return {
      tenantId,
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
      ...rest,
      status: traceStatus,
      serviceName: scope === 'serviceMonitor' ? serviceName : rest.serviceName,
      traceId: traceID,
    };
  }, [tenantId, range, query, scope, serviceName]);
  if (!serviceName && requestCompleted && scope == 'serviceMonitor') {
    return <NoServicesHolder />;
  }
  return (
    <div>
      <div className="flex justify-between items-center py-2">
        {filter.length > 1 ? (
          <ContractiveFilter delay={1000} conditions={filter} initValue={defaultQuery} onChange={handleSearch} />
        ) : (
          <div />
        )}
        <TimeSelectWithStore />
      </div>
      {tenantId ? (
        <DiceConfigPage
          scenarioKey="trace-query"
          scenarioType="trace-query"
          showLoading
          forceUpdateKey={['inParams']}
          inParams={params}
          customProps={{
            page: {
              props: {
                whiteBg: true,
                className: 'p-4',
              },
            },
            table: {
              props: {
                tableProps: {
                  rowKey: (record: ITableRow) => {
                    return record.traceId.data.text;
                  },
                },
              },
              op: {
                clickRow: (data: ITableRow) => {
                  update({
                    traceId: data.traceId.data.text,
                    startTime: moment(data.traceStartTime.data.text).valueOf(),
                  });
                  setIsShowTraceDetail(true);
                },
              },
            },
            reqDistribution: {
              props: {
                style: {
                  width: '100%',
                  height: '170px',
                  minHeight: 0,
                },
              },
            },
          }}
        />
      ) : null}
      <TraceSearchDetail traceId={traceId} startTime={startTime} />
    </div>
  );
};

export default TraceSearch;

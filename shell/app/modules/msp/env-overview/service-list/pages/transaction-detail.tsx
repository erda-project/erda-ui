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
import Ellipsis from 'common/components/ellipsis';
import ErdaIcon from 'common/components/erda-icon';
import RadioTabs from 'common/components/radio-tabs';
import i18n from 'i18n';
import { qs } from 'common/utils';
import TimeSelect from 'common/components/time-select';
import DiceConfigPage from 'config-page';
import { Drawer } from 'antd';
import monitorCommonStore from 'common/stores/monitorCommon';
import { ITimeRange, transformRange } from 'common/components/time-select/common';
import moment, { Moment } from 'moment';
import { useUpdate } from 'common/use-hooks';
import TraceSearchDetail from 'trace-insight/pages/trace-querier/trace-search-detail';
import { Copy } from 'common';
import routeInfoStore from 'core/stores/route';

const indicators = [
  'kvGrid@totalCount',
  'kvGrid@avgRps',
  'kvGrid@avgDuration',
  'kvGrid@slowCount',
  'kvGrid@errorCount',
  'kvGrid@errorRate',
];

interface IProps {
  layerPath?: string;
  transactionType: string;
  visible: boolean;
  tenantId: string;
  serviceId: string;
  closeDetail: () => void;
  timeRange: IState['detailParams'];
  defaultScenarioName?: string;
}

interface IState {
  scenarioName: string;
  traceId?: string;
  startTime?: number;
  detailParams: {
    _?: number;
    startTime: number;
    endTime: number;
  };
}

interface ITableItem {
  occurTime: {
    data: { text: string };
  };
  traceId: {
    data: { text: string };
  };
}

const TransactionDetail: React.FC<IProps> = ({
  layerPath,
  transactionType,
  visible,
  closeDetail,
  serviceId,
  tenantId,
  timeRange,
  defaultScenarioName,
}) => {
  const [{ detailParams, scenarioName, traceId, startTime }, updater, update] = useUpdate<IState>({
    traceId: undefined,
    startTime: undefined,
    scenarioName: `${transactionType}-detail`,
    detailParams: timeRange,
  });
  const { setIsShowTraceDetail } = monitorCommonStore.reducers;
  React.useEffect(() => {
    update({ detailParams: timeRange, scenarioName: defaultScenarioName ?? `${transactionType}-detail` });
  }, [timeRange, transactionType, defaultScenarioName]);
  const [rangeData, refreshStrategy] = React.useMemo(() => {
    if (visible) {
      const query = routeInfoStore.getState((s) => s.query);
      if (query.layerPath) {
        return [
          {
            mode: 'customize',
            customize: {
              start: moment(+detailParams.startTime),
              end: moment(+detailParams.endTime),
            },
          },
          monitorCommonStore.getState((s) => s.globalTimeSelectSpan.refreshStrategy),
        ];
      } else {
        return monitorCommonStore.getState((s) => [
          s.globalTimeSelectSpan.data,
          s.globalTimeSelectSpan.refreshStrategy,
        ]);
      }
    }
    return [];
  }, [visible]);

  const copyPath = React.useMemo(() => {
    const { pathname, origin } = window.location;
    const query = {
      ...detailParams,
      layerPath,
      transactionType,
      detailType: scenarioName,
    };
    const queryStr = qs.stringify(query);
    return `${origin}${pathname}?${queryStr}`;
  }, [detailParams, layerPath, transactionType, scenarioName]);

  const handleTimeChange = (_range: ITimeRange, [start, end]: Moment[]) => {
    updater.detailParams({
      _: Date.now(),
      startTime: start.valueOf(),
      endTime: end.valueOf(),
    });
  };

  const handleChangeType = (type: string) => {
    const range = monitorCommonStore.getState((s) => s.globalTimeSelectSpan.data);
    const { date } = transformRange(range);
    update({
      detailParams: {
        _: Date.now(),
        startTime: date[0].valueOf(),
        endTime: date[1].valueOf(),
      },
      scenarioName: type,
    });
  };

  const openTrace = (data: ITableItem) => {
    const traceID = data.traceId.data.text;
    if (traceID !== '-') {
      update({
        traceId: traceID,
        startTime: moment(data.occurTime.data.text).valueOf(),
      });
      setIsShowTraceDetail(true);
    }
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center pr-8">
            <Ellipsis className="flex-1" title={layerPath ?? '-'} />
            <Copy selector=".cursor-copy">
              <ErdaIcon
                type="share-one"
                className="hover-active cursor-copy ml-1"
                data-clipboard-text={copyPath}
                data-clipboard-tip={i18n.t('link')}
              />
            </Copy>
          </div>
        }
        className="transaction-detail-drawer"
        visible={visible}
        width="80%"
        onClose={closeDetail}
        destroyOnClose
      >
        <div className="px-4">
          <div className="flex justify-between items-center h-8 my-2">
            <RadioTabs
              defaultValue={defaultScenarioName ?? scenarioName}
              options={[
                {
                  label: i18n.t('msp:overview'),
                  value: `${transactionType}-detail`,
                },
                {
                  label: i18n.t('msp:slow call'),
                  value: `${transactionType}-slow`,
                },
              ]}
              onChange={handleChangeType}
            />
            <TimeSelect
              className="ml-3"
              defaultValue={rangeData}
              defaultStrategy={refreshStrategy}
              onChange={handleTimeChange}
            />
          </div>
          {layerPath ? (
            <DiceConfigPage
              key={scenarioName}
              scenarioKey={scenarioName}
              scenarioType={scenarioName}
              showLoading
              forceUpdateKey={['inParams']}
              inParams={{ ...detailParams, tenantId, serviceId, layerPath }}
              customProps={{
                grid: {
                  props: {
                    gutter: 8,
                    span: [12, 12, 12, 12],
                  },
                },
                kvGrid: {
                  props: {
                    gutter: 0,
                  },
                },
                metricTable: {
                  op: {
                    clickRow: openTrace,
                  },
                },
                ...['rps', 'avgDuration', 'slowCount', 'errorCount', 'slowReqDistribution'].reduce(
                  (previousValue, currentValue) => ({
                    ...previousValue,
                    [currentValue]: {
                      props: {
                        className: 'mb-2',
                        style: {
                          width: '100%',
                          height: '170px',
                          minHeight: 0,
                        },
                      },
                    },
                  }),
                  {},
                ),
                ...indicators.reduce(
                  (previousValue, currentValue) => ({
                    ...previousValue,
                    [currentValue]: {
                      props: {
                        gutter: 0,
                      },
                    },
                  }),
                  {},
                ),
              }}
            />
          ) : null}
        </div>
      </Drawer>
      <TraceSearchDetail traceId={traceId} startTime={startTime} />
    </>
  );
};

export default TransactionDetail;

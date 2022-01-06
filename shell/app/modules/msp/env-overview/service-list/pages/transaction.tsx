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
import i18n from 'i18n';
import { Drawer } from 'antd';
import { TimeSelectWithStore } from 'msp/components/time-select';
import RadioTabs from 'common/components/radio-tabs';
import monitorCommonStore from 'common/stores/monitorCommon';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import DiceConfigPage from 'config-page';
import routeInfoStore from 'core/stores/route';
import Ellipsis from 'common/components/ellipsis';
import TimeSelect from 'common/components/time-select';
import { ITimeRange, transformRange } from 'common/components/time-select/common';
import { Moment } from 'moment';
import { useUpdate } from 'common/use-hooks';
import './transaction.scss';

const dashboardIdMap = [
  {
    value: 'transaction-http',
    label: i18n.t('msp:HTTP call'),
  },
  {
    value: 'transaction-rpc',
    label: i18n.t('msp:RPC call'),
  },
  {
    value: 'transaction-cache',
    label: i18n.t('msp:Cache call'),
  },
  {
    value: 'transaction-db',
    label: i18n.t('msp:Database call'),
  },
  {
    value: 'transaction-mq',
    label: i18n.t('msp:MQ call'),
  },
];

interface IState {
  transactionType: string;
  visible: boolean;
  detailParams: {
    _?: number;
    startTime: number;
    endTime: number;
  };
  analysisParams: {
    _?: number;
    startTime: number;
    endTime: number;
  };
  recordItem?: {
    id: string;
    transactionName: {
      data: {
        text: string;
      };
    };
  };
}

const indicators = [
  'kvGrid@totalCount',
  'kvGrid@avgRps',
  'kvGrid@avgDuration',
  'kvGrid@slowCount',
  'kvGrid@errorCount',
  'kvGrid@errorRate',
];

const getTimeParams = (startTime: number, endTime: number) => ({
  startTime,
  endTime,
  _: Date.now(), // fixed bug that refresh button is invalid when absolute time is selected
});

const Transaction = () => {
  const [range, rangeData, refreshStrategy] = monitorCommonStore.useStore((s) => [
    s.globalTimeSelectSpan.range,
    s.globalTimeSelectSpan.data,
    s.globalTimeSelectSpan.refreshStrategy,
  ]);

  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const [serviceId, requestCompleted] = serviceAnalyticsStore.useStore((s) => [s.serviceId, s.requestCompleted]);
  const [{ transactionType, visible, recordItem, detailParams, analysisParams }, updater, update] = useUpdate<IState>({
    transactionType: dashboardIdMap[0].value,
    visible: false,
    recordItem: undefined,
    detailParams: {
      _: range.triggerTime,
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
    },
    analysisParams: {
      _: range.triggerTime,
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
    },
  });

  React.useEffect(() => {
    updater.analysisParams(getTimeParams(range.startTimeMs, range.endTimeMs));
  }, [range]);

  React.useEffect(() => {
    if (!visible) {
      updater.detailParams(getTimeParams(range.startTimeMs, range.endTimeMs));
    }
  }, [visible, range]);

  const handleChangeType = React.useCallback(
    (type: string) => {
      const { date } = transformRange(rangeData);
      update({
        transactionType: type,
        analysisParams: getTimeParams(date[0].valueOf(), date[1].valueOf()),
      });
    },
    [rangeData],
  );

  const openDetail = (item: IState['recordItem']) => {
    const { date } = transformRange(rangeData);
    update({
      visible: true,
      recordItem: item,
      detailParams: getTimeParams(date[0].valueOf(), date[1].valueOf()),
    });
  };

  const closeDetail = () => {
    update({
      visible: false,
      recordItem: undefined,
    });
  };

  const handleTimeChange = (_range: ITimeRange, [start, end]: Moment[]) => {
    updater.detailParams(getTimeParams(start.valueOf(), end.valueOf()));
  };

  if (!serviceId && requestCompleted) {
    return <NoServicesHolder />;
  }
  return (
    <div>
      <div className="flex justify-between mb-3">
        <RadioTabs value={transactionType} options={dashboardIdMap} onChange={handleChangeType} />
        <TimeSelectWithStore className="ml-3" />
      </div>
      {serviceId && tenantId ? (
        <DiceConfigPage
          key={`${transactionType}-analysis`}
          scenarioKey={`${transactionType}-analysis`}
          scenarioType={`${transactionType}-analysis`}
          showLoading
          forceUpdateKey={['inParams']}
          inParams={{ tenantId, serviceId, ...analysisParams }}
          customProps={{
            page: {
              props: {
                className: 'bg-white',
              },
            },
            ...['rps', 'avgDuration'].reduce(
              (previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: {
                  props: {
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
            table: {
              op: {
                clickRow: openDetail,
              },
            },
          }}
        />
      ) : null}
      <Drawer
        title={<Ellipsis title={recordItem?.transactionName.data.text ?? '-'} />}
        className="transaction-detail-drawer"
        visible={visible}
        width="80%"
        onClose={closeDetail}
        destroyOnClose
      >
        <div className="px-4">
          <div className="flex justify-end items-center h-8 my-2">
            <TimeSelect
              className="ml-3"
              theme="dark"
              defaultValue={rangeData}
              defaultStrategy={refreshStrategy}
              onChange={handleTimeChange}
            />
          </div>
          {recordItem?.transactionName.data.text ? (
            <DiceConfigPage
              scenarioKey={`${transactionType}-detail`}
              scenarioType={`${transactionType}-detail`}
              showLoading
              forceUpdateKey={['inParams']}
              inParams={{ ...detailParams, tenantId, serviceId, layerPath: recordItem?.transactionName.data.text }}
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
                ...['rps', 'avgDuration', 'slowCount', 'errorCount'].reduce(
                  (previousValue, currentValue) => ({
                    ...previousValue,
                    [currentValue]: {
                      props: {
                        theme: 'dark',
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
                        theme: 'dark',
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
    </div>
  );
};

export default Transaction;

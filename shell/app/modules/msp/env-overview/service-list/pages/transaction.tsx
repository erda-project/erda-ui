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
import { TimeSelectWithStore } from 'msp/components/time-select';
import RadioTabs from 'common/components/radio-tabs';
import monitorCommonStore from 'common/stores/monitorCommon';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import DiceConfigPage from 'config-page';
import routeInfoStore from 'core/stores/route';
import { transformRange } from 'common/components/time-select/utils';
import moment from 'moment';
import { useUpdate } from 'common/use-hooks';
import './transaction.scss';
import { getTimeSpan, setSearch } from 'common/utils';
import TransactionDetail from 'msp/env-overview/service-list/pages/transaction-detail';

const dashboardIdMap = [
  {
    value: 'transaction-http',
    label: i18n.t('msp:HTTP Call'),
  },
  {
    value: 'transaction-rpc',
    label: i18n.t('msp:RPC Call'),
  },
  {
    value: 'transaction-cache',
    label: i18n.t('msp:Cache Call'),
  },
  {
    value: 'transaction-db',
    label: i18n.t('msp:Database Call'),
  },
  {
    value: 'transaction-mq',
    label: i18n.t('msp:MQ Call'),
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
    transactionName: {
      data: {
        text: string;
      };
    };
  };
}

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

  const [tenantId, query] = routeInfoStore.useStore((s) => [s.params.terminusKey, s.query]);
  const [serviceId, requestCompleted] = serviceAnalyticsStore.useStore((s) => [s.serviceId, s.requestCompleted]);
  const [{ transactionType, visible, recordItem, detailParams, analysisParams }, updater, update] = useUpdate<IState>({
    transactionType: query.transactionType ?? dashboardIdMap[0].value,
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
    const { layerPath, endTime, startTime } = query;
    if (layerPath) {
      update({
        visible: true,
        recordItem: {
          transactionName: {
            data: {
              text: layerPath,
            },
          },
        },
        detailParams: getTimeParams(+startTime, +endTime),
      });
    }
  }, []);

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
    setSearch({}, [], true);
    update({
      visible: false,
      recordItem: undefined,
    });
  };

  const handleSelectLineChart = ({ start, end }: { start: string; end: string }) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    const span = getTimeSpan([startMoment, endMoment]);
    monitorCommonStore.reducers.updateState({
      globalTimeSelectSpan: {
        refreshStrategy,
        data: {
          mode: 'customize',
          customize: {
            start: startMoment,
            end: endMoment,
          },
        },
        range: {
          triggerTime: Date.now(),
          ...span,
        },
      },
    });
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
                whiteBg: true,
                className: 'p-4',
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
            ...['rps', 'avgDuration'].reduce(
              (previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: {
                  op: {
                    onSelect: handleSelectLineChart,
                  },
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
      <TransactionDetail
        transactionType={transactionType}
        tenantId={tenantId}
        serviceId={serviceId}
        timeRange={detailParams}
        visible={visible}
        closeDetail={closeDetail}
        defaultScenarioName={query.detailType}
        layerPath={recordItem?.transactionName.data.text}
      />
    </div>
  );
};

export default Transaction;

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

/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { find, get, forEach, isEmpty, mapKeys, map } from 'lodash';
import moment from 'moment';
import { useMount } from 'react-use';
import { useUpdate, TimeSelector, Holder, PureBoardGrid } from 'common';
import i18n from 'i18n';
import dubboStore from '../../stores/dubbo';
import routeInfoStore from 'app/common/stores/route';
import microServiceInfoStore from 'app/modules/microService/stores/info';
import monitorCommonStore from 'common/stores/monitorCommon';
import './interface-detail.scss';

const chartArr = [
  {
    title: `${i18n.t('microService:number of interface calls')}`,
    type: 'qps',
    i: 'register-qps',
  },
  {
    title: `${i18n.t('microService:number of failed calls')}`,
    type: 'failed',
    i: 'register-failed',
  },
  {
    title: `${i18n.t('microService:average call time')}`,
    type: 'avgtime',
    i: 'register-avgtime',
  },
];

const InterfaceDetail = () => {
  const timeSpan = monitorCommonStore.useStore(s => s.timeSpan);
  const { interfacename, az } = routeInfoStore.getState(s => s.query);
  const dubboDetailTime = dubboStore.useStore(s => s.dubboDetailTime);
  const infoList = microServiceInfoStore.useStore(s => s.infoList);
  const { getMSComponentInfo } = microServiceInfoStore.effects;
  const { getDubboDetailTime, getDubboDetailChart } = dubboStore.effects;
  const [state, updater] = useUpdate({
    layout: [],
  });
  const isAvailable = az && interfacename;

  useMount(() => {
    getMSComponentInfo();
  });

  React.useEffect(() => {
    const info = find(infoList, { addonName: 'registercenter' });
    if (isAvailable && info && get(info, 'config.DUBBO_TENANT_ID')) {
      const tenantId = get(info, 'config.DUBBO_TENANT_ID');
      getDubboDetailTime({ interfacename, az, tenantId });
      updater.layout(getLayout(tenantId));
    }
  }, [infoList, interfacename, az, isAvailable, getDubboDetailTime, updater]);

  const getLayout = (tenantId: string) => map(chartArr, ({ title, type, i }) => ({
    w: 24,
    h: 9,
    x: 0,
    y: 0,
    i,
    moved: false,
    static: false,
    view: {
      title,
      chartType: 'chart:line',
      hideReload: true,
      chartQuery: {
        az, interfacename, tenantId, start: timeSpan.startTimeMs, end: timeSpan.endTimeMs, point: 60, chartType: type,
      },
      loadData: getDubboDetailChart,
      dataConvertor(responseData: any) {
        if (isEmpty(responseData)) return {};
        const { time = [], results = [] } = responseData || {};
        const data = get(results, '[0].data') || [];
        const metricData = [] as object[];
        const yAxis = [];

        forEach(data, (item) => {
          mapKeys(item, (v) => {
            const { chartType, ...rest } = v;
            yAxis[v.axisIndex] = 1;
            metricData.push({
              ...rest,
              name: '',
              type: chartType || 'line',
            });
          });
        });
        const yAxisLength = yAxis.length;
        const formatTime = time.map(t => moment(t).format('MM-DD HH:mm'));
        return { xData: formatTime, metricData, yAxisLength, xAxisIsTime: true };
      },
    },
  }));

  return (
    <div>
      <div className="interface-register-time mb20">
        <p className="mb12">{`Provider ${i18n.t('microService:register time')}：${moment(dubboDetailTime.providerTime).format('YYYY-MM-DD HH:mm:ss')}`}</p>
        <p>{`Consumer ${i18n.t('microService:register time')}：${moment(dubboDetailTime.consumerTime).format('YYYY-MM-DD HH:mm:ss')}`}</p>
      </div>
      <TimeSelector defaultTime={24} />
      <Holder when={!isAvailable || !state.layout}>
        <PureBoardGrid layout={state.layout} />
      </Holder>
    </div>
  );
};

export default InterfaceDetail;

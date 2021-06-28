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
import React, { useEffect, useState } from 'react';
import { set, get, isEmpty } from 'lodash';
import { FilterGroup, IF, PureBoardGrid } from 'common';
import { daysRange } from 'common/utils';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import gatewayStore from 'msp/stores/gateway';
import monitorCommonStore from 'common/stores/monitorCommon';
import metricsMonitorStore from 'common/stores/metrics';

const resourceInfo = { resourceType: 'multipleGroup', resourceId: 'package-analyze' };

export const PurePackageAnalyze = () => {
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [timeSpan] = monitorCommonStore.useStore((s) => [s.timeSpan]);
  const metricItem = metricsMonitorStore.useStore((s) => s.metricItem) || {};
  const { loadGatewayMetricItem } = metricsMonitorStore.effects;
  const succSumData = metricItem['multipleGroup-package-analyze-pa-succ-sum'] || {};
  const realTimeData = metricItem['multipleGroup-package-analyze-pa-real-time'] || {};
  const [projectInfo, apiFilterCondition] = gatewayStore.useStore((s) => [s.projectInfo, s.apiFilterCondition]);
  const { env, projectId } = params;
  const { csmr } = query;
  const { start, end } = daysRange(7);
  const { startTimeMs, endTimeMs } = timeSpan;
  const { apiConsumers = [] } = apiFilterCondition;

  const commonQuery = {
    filter_dpid: projectId,
    filter_denv: env.toLowerCase(),
    group: 'pack',
    filter_csmr: csmr,
    align: false,
    projectId,
  };

  const [succSumQuery, setSuccSumQuery] = useState({
    fetchMetricKey: 'kong_success',
    start,
    end,
    sum: 'succ_sum',
    ...commonQuery,
    points: 7,
  } as any);

  const [realTimeQuery, setRealTimeQuery] = useState({
    fetchMetricKey: 'kong_traffic',
    start: startTimeMs,
    end: endTimeMs,
    ...commonQuery,
    sumCps: ['cnt_sum', 'succ_sum', 'err_sum', 'lim_sum'],
  } as any);

  const [succSumStaticData, setSuccSumStaticData] = useState({} as any);
  const [selectedGroup, setSelectedGroup] = useState();
  const [groups, setGroups] = useState([]);

  const [realTimeStaticData, setRealTimeStaticData] = useState({} as any);

  const dataConvertor = (chart: string, name?: string) => {
    const isSuccSum = chart === 'succ-sum';
    const { results, time } = isSuccSum ? succSumData : realTimeData;
    if (!results) return;
    const targetTag = name || get(results, '[0].group');
    const selectResult = results.filter((result: any) => result.group === targetTag);
    isSuccSum && selectResult.forEach((result: any) => set(result, 'chartType', 'bar'));
    const data = {
      metricData: selectResult,
      time,
    };
    if (isSuccSum) {
      const gs = results.map((result: any) => result.group);
      setSuccSumStaticData(data);
      setGroups(gs);
      setSelectedGroup(targetTag);
    } else {
      setRealTimeStaticData(data);
    }
  };

  useEffect(() => {
    !isEmpty(realTimeData) && dataConvertor('real-time');
  }, [realTimeData]);

  useEffect(() => {
    !isEmpty(succSumData) && dataConvertor('succ-sum');
  }, [succSumData]);

  useEffect(() => {
    setRealTimeQuery({ ...realTimeQuery, start: startTimeMs, end: endTimeMs });
  }, [endTimeMs, startTimeMs]);

  const handleChange = (name: string) => {
    dataConvertor('succ-sum', name);
    dataConvertor('real-time', name);
  };

  useEffect(() => {
    if (projectInfo.clusterConfig) {
      const clusterName = projectInfo.clusterConfig[env];
      setSuccSumQuery({ ...succSumQuery, filter_cluster_name: clusterName });
      setRealTimeQuery({ ...realTimeQuery, filter_cluster_name: clusterName });
    }
  }, [env, projectInfo]);

  useEffect(() => {
    succSumQuery.filter_cluster_name &&
      loadGatewayMetricItem({ ...resourceInfo, type: 'pa-succ-sum', chartQuery: succSumQuery });
  }, [loadGatewayMetricItem, succSumQuery]);

  useEffect(() => {
    realTimeQuery.filter_cluster_name &&
      loadGatewayMetricItem({ ...resourceInfo, type: 'pa-real-time', chartQuery: realTimeQuery });
  }, [loadGatewayMetricItem, realTimeQuery]);

  const filters = [
    {
      name: 'csmr',
      placeholder: i18n.t('msp:consumer name'),
      type: 'select',
      options: apiConsumers.map(({ name }: any) => ({ name, value: name })),
    },
  ];

  const onSearch = ({ csmr: value }: { csmr: string }) => {
    setSuccSumQuery({ ...succSumQuery, filter_csmr: value });
    setRealTimeQuery({ ...realTimeQuery, filter_csmr: value });
  };

  const onReset = () => {
    setSuccSumQuery({ ...succSumQuery, filter_csmr: undefined });
    setRealTimeQuery({ ...realTimeQuery, filter_csmr: undefined });
  };

  const layout = [
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'pa-success-sum',
      moved: false,
      static: false,
      view: {
        title: `${i18n.t('msp:successful call amount')}(7${i18n.t('msp:day')})`,
        chartType: 'chart:bar',
        hideReload: true,
        staticData: succSumStaticData,
        controls: ['groupSelect'],
        controlProps: [{ selectedGroup, groups, handleChange, title: i18n.t('msp:choose endpoint') }],
        config: {
          optionProps: {
            timeSpan: { seconds: 24 * 3601 },
            moreThanOneDayFormat: 'M/D',
          },
        },
      },
    },
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'pa-real-time',
      moved: false,
      static: false,
      view: {
        title: i18n.t('msp:real-time traffic'),
        chartType: 'chart:line',
        hideReload: true,
        staticData: realTimeStaticData,
        controls: ['timeRangeSelect'],
        config: {
          optionProps: {
            timeSpan,
            yAxisNames: [' ', ' ', ' ', ' '],
          },
        },
      },
    },
  ];

  return (
    <div className="package-analyze">
      <FilterGroup list={filters} onSearch={onSearch} onReset={onReset} syncUrlOnSearch />
      <IF check={succSumQuery.filter_cluster_name}>
        <PureBoardGrid layout={layout} />
      </IF>
    </div>
  );
};

export { PurePackageAnalyze as PackageAnalyze };

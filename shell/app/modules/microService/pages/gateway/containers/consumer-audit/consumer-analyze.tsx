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
import { set, get } from 'lodash';
import { FilterGroup, IF, PureBoardGrid } from 'common';
import { daysRange } from 'common/utils';
import monitorCommonStore from 'common/stores/monitorCommon';
import i18n from 'i18n';
import routeInfoStore from 'common/stores/route';
import metricsMonitorStore from 'common/stores/metrics';
import gatewayStore from 'microService/stores/gateway';

const resourceInfo = { resourceType: 'multipleGroup', resourceId: 'consumer-analyze' };

export const PureConsumerAnalyze = () => {
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [timeSpan] = monitorCommonStore.useStore((s) => [s.timeSpan]);
  const metricItem = metricsMonitorStore.useStore((s) => s.metricItem) || {};
  const { loadGatewayMetricItem } = metricsMonitorStore.effects;
  const succSumData = get(metricItem, 'multipleGroup-consumer-analyze-ca-succ-sum') || {};
  const realTimeData = get(metricItem, 'multipleGroup-consumer-analyze-ca-real-time') || {};
  const [projectInfo, apiFilterCondition] = gatewayStore.useStore((s) => [s.projectInfo, s.apiFilterCondition]);
  const { env, projectId } = params;
  const { pack } = query;
  const { start, end } = daysRange(7);
  const { startTimeMs, endTimeMs } = timeSpan;
  const { apiPackages = [] } = apiFilterCondition;

  const commonQuery = {
    filter_dpid: projectId,
    filter_denv: env.toLowerCase(),
    group: 'csmr',
    filter_pack: pack,
    projectId,
  };

  const [succSumQuery, setSuccSumQuery] = React.useState(
    {
      fetchMetricKey: 'kong_success',
      start,
      end,
      sum: 'succ_sum',
      ...commonQuery,
      points: 7,
      align: false,
    } as any,
  );

  const [realTimeQuery, setRealTimeQuery] = React.useState(
    {
      fetchMetricKey: 'kong_traffic',
      start: startTimeMs,
      end: endTimeMs,
      ...commonQuery,
      sumCps: ['cnt_sum', 'succ_sum', 'err_sum', 'lim_sum'],
    } as any,
  );

  const [succSumStaticData, setSuccSumStaticData] = React.useState({} as any);
  const [selectedGroup, setSelectedGroup] = React.useState();
  const [groups, setGroups] = React.useState([]);

  const [realTimeStaticData, setRealTimeStaticData] = React.useState({} as any);

  const dataConvertor = (chart: string, name?: string) => {
    const isSuccSum = chart === 'succ-sum';
    const { results, time } = isSuccSum ? succSumData : realTimeData;
    if (!results) return;
    const targetTag = name || (isSuccSum ? get(results, '[0].group') : selectedGroup);
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

  React.useEffect(() => {
    realTimeData && dataConvertor('real-time');
  }, [realTimeData]);

  React.useEffect(() => {
    succSumData && dataConvertor('succ-sum');
  }, [succSumData]);

  React.useEffect(() => {
    setRealTimeQuery({ ...realTimeQuery, start: startTimeMs, end: endTimeMs });
  }, [timeSpan]);

  const handleChange = (name: string) => {
    dataConvertor('succ-sum', name);
    dataConvertor('real-time', name);
  };

  React.useEffect(() => {
    if (projectInfo.clusterConfig) {
      const clusterName = projectInfo.clusterConfig[env];
      setSuccSumQuery({ ...succSumQuery, filter_cluster_name: clusterName });
      setRealTimeQuery({ ...realTimeQuery, filter_cluster_name: clusterName });
    }
  }, [projectInfo]);

  React.useEffect(() => {
    succSumQuery.filter_cluster_name && loadGatewayMetricItem({ ...resourceInfo, type: 'ca-succ-sum', chartQuery: succSumQuery });
  }, [succSumQuery]);

  React.useEffect(() => {
    realTimeQuery.filter_cluster_name && loadGatewayMetricItem({ ...resourceInfo, type: 'ca-real-time', chartQuery: realTimeQuery });
  }, [realTimeQuery]);

  const filters = [
    {
      name: 'pack',
      placeholder: i18n.t('microService:real-time traffic'),
      type: 'select',
      options: apiPackages.map(({ name }: any) => ({ name, value: name })),
    },
  ];

  const onSearch = ({ pack: value }: {pack: string}) => {
    setSuccSumQuery({ ...succSumQuery, filter_pack: value });
    setRealTimeQuery({ ...realTimeQuery, filter_pack: value });
  };

  const onReset = () => {
    setSuccSumQuery({ ...succSumQuery, filter_pack: undefined });
    setRealTimeQuery({ ...realTimeQuery, filter_pack: undefined });
  };

  const layout = [
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'ca-success-sum',
      moved: false,
      static: false,
      view: {
        title: `${i18n.t('microService:successful call amount')}(7${i18n.t('microService:day')})`,
        chartType: 'chart:bar',
        hideReload: true,
        chartQuery: succSumQuery,
        staticData: succSumStaticData,
        controls: ['groupSelect'],
        controlProps: [{ selectedGroup, groups, handleChange, title: `${i18n.t('microService:select consumer')}:` }],
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
      i: 'ca-real-time',
      moved: false,
      static: false,
      view: {
        title: i18n.t('microService:endpoint name'),
        chartType: 'chart:line',
        hideReload: true,
        chartQuery: realTimeQuery,
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
    <div className="consumer-analyze">
      <FilterGroup list={filters} onSearch={onSearch} onReset={onReset} syncUrlOnSearch />
      <IF check={succSumQuery.filter_cluster_name}>
        <PureBoardGrid layout={layout} />
      </IF>
    </div>
  );
};

export { PureConsumerAnalyze as ConsumerAnalyze };

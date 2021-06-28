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
import { Spin } from 'app/nusi';
import { FilterGroup, IF, TimeSelector, PureBoardGrid } from 'common';
import { HTTP_METHODS } from '../../config';
import { groupHandler } from 'common/utils/chart-utils';
import { chartRender } from 'api-insight/common/components/apiRenderFactory';
import monitorChartStore from 'monitor-common/stores/monitorChart';
import { get, isEmpty } from 'lodash';
import { HotSpotPanel } from './hot-spot';
import monitorCommonStore from 'common/stores/monitorCommon';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import gatewayStore from 'msp/stores/gateway';
import metricsMonitorStore from 'common/stores/metrics';
import { useLoading } from 'core/stores/loading';

const resourceInfo = { resourceType: 'multipleGroup', resourceId: 'hotSpot-analyze' };

export const PureHotSpotAnalyze = () => {
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [projectInfo, apiFilterCondition] = gatewayStore.useStore((s) => [s.projectInfo, s.apiFilterCondition]);
  const metricItem = metricsMonitorStore.useStore((s) => s.metricItem);
  const realTimeData = get(metricItem, 'ultipleGroup-hotSpot-analyze-ha-real-time');
  const { loadMetricItem } = metricsMonitorStore.effects;
  const [loadMetricItemLoading] = useLoading(metricsMonitorStore, ['loadMetricItem']);
  const [getProjectInfoLoading] = useLoading(gatewayStore, ['getProjectInfo']);
  const isFetching = loadMetricItemLoading || getProjectInfoLoading;

  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const chart = monitorChartStore.useStore((s) => s.APIRequest);
  const hotSpotData = get(chart, 'hot-spot.results', []);
  const { env, projectId } = params;
  const { csmr, pack, papi, mthd } = query;
  const { startTimeMs, endTimeMs } = timeSpan;
  const { apiConsumers = [], apiPackages = [] } = apiFilterCondition;

  const commonQuery = {
    filter_dpid: projectId,
    filter_denv: env.toLowerCase(),
    start: startTimeMs,
    end: endTimeMs,
    filter_papi: papi,
    projectId,
  };

  const [hotSpotQuery, setHotSpotQuery] = React.useState({
    ...commonQuery,
    group: 'pmapi',
    sum: 'succ_sum',
    filter_csmr: csmr,
    filter_pack: pack,
    filter_mthd: mthd,
    sort: 'sum_succ_sum',
    limit: 10,
    points: 7,
  } as any);

  const [realTimeQuery, setRealTimeQuery] = React.useState({
    fetchMetricKey: 'kong_traffic',
    ...commonQuery,
    sumCps: 'succ_sum',
    customAPIPrefix: '/api/gateway/openapi/metrics/charts/',
  } as any);

  const HotSpot = React.useMemo(
    () =>
      chartRender({
        moduleName: 'APIRequest',
        groupId: 'apiRequest',
        titleText: i18n.t('msp:hot statistics'),
        chartName: 'hot-spot',
        viewRender: HotSpotPanel,
        isCustomApi: true,
        fetchApi: '/api/gateway/openapi/metrics/charts/kong_success',
        query: { ...commonQuery, ...hotSpotQuery },
        dataHandler: groupHandler(['sum.succ_sum']),
      }),
    [hotSpotQuery],
  ) as React.ElementType;

  const [selectedGroup, setSelectedGroup] = React.useState();
  const [groups, setGroups] = React.useState([]);

  const [realTimeStaticData, setRealTimeStaticData] = React.useState({} as any);

  const dataConvertor = (name?: string) => {
    const { results, time } = realTimeData;
    if (!results) return;
    const data = {
      metricData: results,
      time,
    };
    setRealTimeStaticData(data);
    name && setSelectedGroup(name);
  };

  React.useEffect(() => {
    realTimeData && dataConvertor();
  }, [realTimeData]);

  React.useEffect(() => {
    setHotSpotQuery({ ...hotSpotQuery, start: startTimeMs, end: endTimeMs });
    setRealTimeQuery({ ...realTimeQuery, start: startTimeMs, end: endTimeMs });
  }, [timeSpan]);

  React.useEffect(() => {
    if (!isEmpty(hotSpotData)) {
      const hotSpotGroups = hotSpotData.map((data: any) => data.name);
      setGroups(hotSpotGroups);
      setSelectedGroup(hotSpotGroups[0]);
    }
  }, [hotSpotData]);

  const handleChange = (name: string) => {
    dataConvertor(name);
  };

  React.useEffect(() => {
    if (projectInfo.clusterConfig) {
      const clusterName = projectInfo.clusterConfig[env];
      setHotSpotQuery({ ...hotSpotQuery, filter_cluster_name: clusterName });
      setRealTimeQuery({ ...realTimeQuery, filter_cluster_name: clusterName });
    }
  }, [projectInfo]);

  React.useEffect(() => {
    selectedGroup &&
      realTimeQuery.filter_cluster_name &&
      loadMetricItem({ ...resourceInfo, type: 'ha-real-time', chartQuery: realTimeQuery, filter_pmapi: selectedGroup });
  }, [selectedGroup]);

  const filters = [
    {
      name: 'csmr',
      placeholder: i18n.t('msp:consumer name'),
      type: 'select',
      options: apiConsumers.map(({ name }: any) => ({ name, value: name })),
    },
    {
      name: 'pack',
      placeholder: i18n.t('msp:endpoint name'),
      type: 'select',
      options: apiPackages.map(({ name }: any) => ({ name, value: name })),
    },
    {
      name: 'mthd',
      placeholder: i18n.t('msp:request method'),
      type: 'select',
      options: HTTP_METHODS,
    },
    {
      name: 'papi',
      placeholder: i18n.t('msp:request path'),
    },
    {
      name: 'timeSpan',
      type: 'custom',
      Comp: <TimeSelector defaultTime={24} />,
    },
  ];

  const onSearch = ({ csmr: filter_csmr, pack: filter_pack, mthd: filter_mthd, papi: filter_papi }: any) => {
    setHotSpotQuery({ ...hotSpotQuery, filter_csmr, filter_pack, filter_mthd, filter_papi });
  };

  const onReset = () => {
    setHotSpotQuery({
      ...hotSpotQuery,
      filter_csmr: undefined,
      filter_pack: undefined,
      filter_mthd: undefined,
      filter_papi: undefined,
    });
  };

  const layout = [
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'ha-real-time',
      moved: false,
      static: false,
      view: {
        title: i18n.t('msp:real-time traffic'),
        chartType: 'chart:line',
        hideReload: true,
        staticData: realTimeStaticData,
        controls: ['groupSelect'],
        controlProps: [{ selectedGroup, groups, handleChange, title: i18n.t('msp:select api:'), width: 300 }],
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
    <div className="hotSpot-analyze">
      <FilterGroup list={filters} onSearch={onSearch} onReset={onReset} syncUrlOnSearch />
      <Spin spinning={isFetching}>
        <IF check={hotSpotQuery.filter_cluster_name}>
          <HotSpot />
          <IF check={selectedGroup}>
            <PureBoardGrid layout={layout} />
          </IF>
        </IF>
      </Spin>
    </div>
  );
};

export const HotSpotAnalyze = PureHotSpotAnalyze;

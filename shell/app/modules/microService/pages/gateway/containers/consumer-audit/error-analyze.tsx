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
import { FilterGroup, IF, TimeSelector, PureBoardGrid } from 'common';
import { get, isEmpty } from 'lodash';
import { chartRender } from 'api-insight/common/components/apiRenderFactory';
import { HTTP_METHODS } from '../../config';
import { groupHandler } from 'common/utils/chart-utils';
import { TopErrorPanel } from './top-error';
import monitorCommonStore from 'common/stores/monitorCommon';
import monitorChartStore from 'monitor-common/stores/monitorChart';
import { Spin } from 'app/nusi';
import i18n from 'i18n';
import gatewayStore from 'microService/stores/gateway';
import metricsMonitorStore from 'common/stores/metrics';
import routeInfoStore from 'common/stores/route';
import { useLoading } from 'app/common/stores/loading';

const resourceInfo = { resourceType: 'multipleGroup', resourceId: 'error-analyze' };

export const PureErrorAnalyze = () => {
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [projectInfo, apiFilterCondition] = gatewayStore.useStore((s) => [s.projectInfo, s.apiFilterCondition]);
  const metricItem = metricsMonitorStore.useStore((s) => s.metricItem) || {};
  const { loadMetricItem } = metricsMonitorStore.effects;
  const [loadMetricItemLoading] = useLoading(metricsMonitorStore, ['loadMetricItem']);
  const [getProjectInfoLoading] = useLoading(gatewayStore, ['getProjectInfo']);
  const isFetching = loadMetricItemLoading || getProjectInfoLoading;
  const errorTypeData = get(metricItem, 'multipleGroup-error-analyze-error-type');
  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const chart = monitorChartStore.useStore((s) => s.APIRequest);
  const topErrorData = get(chart, 'top-error.results', []);
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

  const [topErrorQuery, setTopErrorQuery] = React.useState(
    {
      ...commonQuery,
      group: 'pmapi',
      sum: 'err_sum',
      filter_csmr: csmr,
      filter_pack: pack,
      filter_mthd: mthd,
      sort: 'sum_err_sum',
      limit: 10,
    } as any,
  );

  const [errorTypeQuery, setErrorTypeQuery] = React.useState(
    {
      fetchMetricKey: 'kong_error_type',
      ...commonQuery,
      avg: ['(err_mean*100)', '(cerr_mean*100)', '(serr_mean*100)'],
      customAPIPrefix: '/api/gateway/openapi/metrics/charts/',
    } as any,
  );

  const TopError = React.useMemo(() => chartRender({
    moduleName: 'APIRequest',
    groupId: 'apiRequest',
    titleText: `top ${i18n.t('microService:error statistics')}`,
    chartName: 'top-error',
    viewRender: TopErrorPanel,
    isCustomApi: true,
    fetchApi: '/api/gateway/openapi/metrics/charts/kong_error',
    query: { ...commonQuery, ...topErrorQuery },
    dataHandler: groupHandler(['sum.err_sum']),
  }), [topErrorQuery]) as React.ElementType;

  const [selectedGroup, setSelectedGroup] = React.useState('');
  const [groups, setGroups] = React.useState([]);

  const [realTimeStaticData, setRealTimeStaticData] = React.useState({} as any);

  const dataConvertor = (name?: string) => {
    const { results, time } = errorTypeData;
    if (!results) return;
    const data = {
      metricData: results,
      time,
    };
    setRealTimeStaticData(data);
    name && setSelectedGroup(name);
  };

  React.useEffect(() => {
    errorTypeData && dataConvertor();
  }, [errorTypeData]);

  React.useEffect(() => {
    setTopErrorQuery({ ...topErrorQuery, start: startTimeMs, end: endTimeMs });
    setErrorTypeQuery({ ...errorTypeQuery, start: startTimeMs, end: endTimeMs });
  }, [timeSpan]);

  React.useEffect(() => {
    if (!isEmpty(topErrorData)) {
      const topErrorGroups = topErrorData.map((data: any) => data.name);
      setGroups(topErrorGroups);
      setSelectedGroup(topErrorGroups[0]);
    }
  }, [topErrorData]);

  const handleChange = (name: string) => {
    dataConvertor(name);
  };

  React.useEffect(() => {
    if (projectInfo.clusterConfig) {
      const clusterName = projectInfo.clusterConfig[env];
      setTopErrorQuery({ ...topErrorQuery, filter_cluster_name: clusterName });
      setErrorTypeQuery({ ...errorTypeQuery, filter_cluster_name: clusterName });
    }
  }, [projectInfo]);

  React.useEffect(() => {
    selectedGroup && errorTypeQuery.filter_cluster_name && loadMetricItem({ ...resourceInfo, type: 'error-type', chartQuery: { ...errorTypeQuery, filter_pmapi: selectedGroup } });
  }, [selectedGroup]);

  const filters = [
    {
      name: 'csmr',
      placeholder: i18n.t('microService:consumer name'),
      type: 'select',
      options: apiConsumers.map(({ name }: any) => ({ name, value: name })),
    },
    {
      name: 'pack',
      placeholder: i18n.t('microService:endpoint name'),
      type: 'select',
      options: apiPackages.map(({ name }: any) => ({ name, value: name })),
    },
    {
      name: 'mthd',
      placeholder: i18n.t('microService:request method'),
      type: 'select',
      options: HTTP_METHODS,
    },
    {
      name: 'papi',
      placeholder: i18n.t('microService:request path'),
    },
    {
      name: 'timeSpan',
      type: 'custom',
      Comp: <TimeSelector defaultTime={24} />,
    },
  ];

  const onSearch = ({ csmr: filter_csmr, pack: filter_pack, mthd: filter_mthd, papi: filter_papi }: any) => {
    setTopErrorQuery({ ...topErrorQuery, filter_csmr, filter_pack, filter_mthd, filter_papi });
  };

  const onReset = () => {
    setTopErrorQuery({ ...topErrorQuery, filter_csmr: undefined, filter_pack: undefined, filter_mthd: undefined, filter_papi: undefined });
  };

  const layout = [
    {
      w: 24,
      h: 9,
      x: 0,
      y: 0,
      i: 'error-type',
      moved: false,
      static: false,
      view: {
        title: i18n.t('microService:error type analytics'),
        chartType: 'chart:line',
        hideReload: true,
        staticData: realTimeStaticData,
        controls: ['groupSelect'],
        controlProps: [{ selectedGroup, groups, handleChange, title: i18n.t('microService:select api:'), width: 300 }],
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
    <div className="error-analyze">
      <FilterGroup list={filters} onSearch={onSearch} onReset={onReset} syncUrlOnSearch />
      <Spin spinning={isFetching}>
        <IF check={topErrorQuery.filter_cluster_name}>
          <TopError />
          <IF check={selectedGroup}>
            <PureBoardGrid layout={layout} />
          </IF>
        </IF>
      </Spin>
    </div>
  );
};

export const ErrorAnalyze = PureErrorAnalyze;

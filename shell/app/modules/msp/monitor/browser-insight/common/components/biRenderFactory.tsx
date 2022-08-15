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
import { ChartBaseFactory } from 'monitor-common';
import SortBaseFactory from './sort-list/sortFactory';
import monitorCommonStore from 'common/stores/monitorCommon';
import { BoardGrid, Holder } from 'common';
import { useMount } from 'react-use';
import CommonDashboardStore from 'common/stores/dashboard';
import { isEmpty } from 'lodash';
import routeInfoStore from 'core/stores/route';

const DashBoard = React.memo(BoardGrid.Pure);

export const chartRender = (obj: any) => {
  if (!obj) return null;
  const reQuery = {
    ...(obj.query || {}),
    dependentKey: { start: 'startTimeMs', end: 'endTimeMs', filter_tk: 'terminusKey' },
  };
  const { fetchApi: api, ...rest } = obj;
  return (props: any) => {
    const { query, fetchApi, ...ownProps } = props;
    const { chartName } = ownProps || {};
    const Chart = ChartBaseFactory.create({ chartName, ...rest });
    const reApi = fetchApi || api;
    const reFetchApi = reApi && `/api/spot/tmc/metrics/${reApi}`;
    return <Chart {...rest} {...ownProps} fetchApi={reFetchApi} query={{ ...query, ...reQuery }} />;
  };
};

export const sortRender = (obj: any) => {
  if (!obj) return null;
  const { query = {}, fetchApi, ...rest } = obj;
  const SortPanel = SortBaseFactory.create({ ...rest });
  const commonQuery = {
    format: 'chartv2',
    ql: 'influxql:ast',
    type: '_',
    filter__metric_scope: 'micro_service',
  };
  query.dependentKey = { start: 'startTimeMs', end: 'endTimeMs', filter__metric_scope_id: 'terminusKey' };
  return (props: any) => (
    <SortPanel {...props} {...rest} query={{ ...query, ...commonQuery }} fetchApi={`/api/tmc/metrics-query`} />
  );
};

export const DashboardRender = ({ daboardId, ...rest }: { daboardId: string; [pro: string]: any }) => {
  const [timeSpan] = monitorCommonStore.useStore((s) => [s.globalTimeSelectSpan.range]);
  const terminusKey = routeInfoStore.useStore((s) => s.params.terminusKey);

  const [chartLayout, setChartLayout] = React.useState<DC.Layout>([]);

  useMount(() => {
    CommonDashboardStore.getCustomDashboard({
      id: daboardId,
      isSystem: true,
    }).then((res) => setChartLayout(res));
  });

  const globalVariable = React.useMemo(
    () => ({
      startTime: timeSpan.startTimeMs,
      endTime: timeSpan.endTimeMs,
      tk: terminusKey,
      ...rest,
    }),
    [timeSpan, terminusKey, rest],
  );

  return (
    <Holder when={isEmpty(chartLayout)}>
      <DashBoard layout={chartLayout} globalVariable={globalVariable} />
    </Holder>
  );
};

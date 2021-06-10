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
import { map } from 'lodash';
import { LoadMore } from 'common';
import { commonChartRender } from 'monitor-common';
import { groupHandler } from 'common/utils/chart-utils';
import ErrorCard from './error-card';
import ErrorFilters from './error-filters';
import routeInfoStore from 'app/common/stores/route';
import monitorErrorStore from 'error-insight/stores/error';
import monitorCommonStore from 'common/stores/monitorCommon';
import monitorOverviewStore from 'monitor-overview/stores/monitor-overview';
import { useLoading } from 'app/common/stores/loading';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';

import './error-overview.scss';

const errorChartConfig = {
  fetchApi: '/api/tmc/metrics/error_count/histogram',
  query: { sum: 'count' },
  dataHandler: groupHandler('sum.count'),
  moduleName: 'monitorErrors',
  titleText: i18n.t('microService:error statistics'),
  chartName: 'error_count',
};

const ErrorChart = commonChartRender(errorChartConfig) as any;

const ErrorOverview = () => {
  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const workspace = monitorOverviewStore.useStore((s) => s.instance.workspace);
  const { getMonitorInstance } = monitorOverviewStore.effects;
  const [loading] = useLoading(monitorErrorStore, ['getErrorsList']);
  const errors = monitorErrorStore.useStore((s) => s.errors);
  const { getErrorsList } = monitorErrorStore.effects;
  const { clearMonitorErrors } = monitorErrorStore.reducers;
  const { projectId, terminusKey } = routeInfoStore.useStore((s) => s.params);

  useEffectOnce(() => {
    getMonitorInstance();
    return () => clearMonitorErrors();
  });

  React.useEffect(() => {
    clearMonitorErrors();
    getList({ timeSpan, workspace });
  }, [workspace, timeSpan]);

  const getList = (_q?: any) => {
    const q = { timeSpan, workspace, ..._q };
    if (q.workspace) {
      // 只有分支环境参数，才查询list
      const { startTimeMs, endTimeMs } = timeSpan;
      const totalQuery = { startTime: startTimeMs, endTime: endTimeMs, workspace };
      return getErrorsList(totalQuery);
    }
  };

  const { list, offset, total } = errors;
  const isFetchingErrors = loading;
  const hasMore = Number(offset) !== -1;
  // 当env为空时，不可查询
  // shell/app/modules/microService/monitor/monitor-common/components/chartFactory.tsx
  // 临时处理：上面引用的 chartFactory 有个循环渲染的 bug， 受影响的目前只有这一处：
  const query = {
    query: { filter_workspace: workspace, filter_project_id: projectId, filter_terminus_key: terminusKey },
  };
  return (
    <div className="error-overview">
      <ErrorFilters />
      <ErrorChart {...query} />
      <div className="page-total">{`${i18n.t('microService:total number of errors')}：${total}`}</div>
      {map(list, (err, i) => (
        <ErrorCard key={i} data={err} />
      ))}
      <LoadMore load={getList} hasMore={hasMore} isLoading={isFetchingErrors} />
      {!hasMore && list.length > 0 ? (
        <div className="no-more">--------- {i18n.t('microService:no more data')} ----------</div>
      ) : null}
    </div>
  );
};

export default ErrorOverview;

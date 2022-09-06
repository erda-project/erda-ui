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
import React from 'react';
import { map, isEmpty } from 'lodash';
import { Holder, BoardGrid, EmptyHolder, Pagination } from 'common';
import ErrorCard from './error-card';
import ErrorFilters from './error-filters';
import routeInfoStore from 'core/stores/route';
import monitorErrorStore from 'error-insight/stores/error';
import monitorCommonStore from 'common/stores/monitorCommon';
import { useLoading } from 'core/stores/loading';
import { Spin } from 'antd';
import { PAGINATION } from 'app/constants';
import CommonDashboardStore from 'common/stores/dashboard';
import { useMount } from 'react-use';
import i18n from 'i18n';
import './error-overview.scss';

const DashBoard = React.memo(BoardGrid.Pure);

const ErrorOverview = () => {
  const timeSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const [loading] = useLoading(monitorErrorStore, ['getErrorsList']);
  const errors = monitorErrorStore.useStore((s) => s.errors);
  const { getErrorsList } = monitorErrorStore.effects;
  const { clearMonitorErrors } = monitorErrorStore.reducers;
  const { terminusKey } = routeInfoStore.useStore((s) => s.params);
  const [{ pageSize, pageNo }, setPagination] = React.useState({ pageNo: 1, pageSize: PAGINATION.pageSize });

  const [chartLayout, setChartLayout] = React.useState<DC.Layout>([]);

  useMount(() => {
    CommonDashboardStore.getCustomDashboard({
      id: 'error_count',
      isSystem: true,
    }).then((res) => setChartLayout(res));
  });

  const globalVariable = React.useMemo(
    () => ({
      startTime: timeSpan.startTimeMs,
      endTime: timeSpan.endTimeMs,
      tk: terminusKey,
    }),
    [timeSpan, terminusKey],
  );

  React.useEffect(() => {
    clearMonitorErrors();
    const { startTimeMs, endTimeMs } = timeSpan;
    getErrorsList({ startTime: startTimeMs, endTime: endTimeMs, scopeId: terminusKey });
    setPagination({ pageNo: 1, pageSize: PAGINATION.pageSize });
  }, [terminusKey, timeSpan]);

  const handleChangePage = (page: number, size: number) => {
    setPagination({ pageNo: page, pageSize: size });
  };

  const total = errors?.length || 0;
  const currentPageList = React.useMemo(() => {
    return (errors || []).slice((pageNo - 1) * pageSize, pageNo * pageSize);
  }, [errors, pageNo, pageSize]);

  return (
    <div className="error-overview">
      <Spin spinning={loading}>
        <ErrorFilters />
        <Holder when={isEmpty(chartLayout)}>
          <DashBoard layout={chartLayout} globalVariable={globalVariable} />
        </Holder>
        <div className="page-total">{`${i18n.t('msp:Total number of errors')}：${total}`}</div>
        {map(currentPageList, (err, i) => (
          <ErrorCard key={i} data={err} />
        ))}
        {total ? (
          <div className="mt-4 flex items-center flex-wrap justify-end">
            <Pagination current={pageNo} pageSize={pageSize} total={total} onChange={handleChangePage} />
          </div>
        ) : (
          <EmptyHolder relative />
        )}
      </Spin>
    </div>
  );
};

export default ErrorOverview;

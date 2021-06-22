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

import React, { useEffect } from 'react';
import i18n from 'i18n';
import { Select } from 'app/nusi';
import { TimeSelector, useUpdate } from 'common';
import routeInfoStore from 'app/common/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyServiceStore from 'microService/stores/topology-service-analyze';
import ServiceListDashboard from './service-list-dashboard';

const sortList = [
  {
    name: i18n.t('microService:last trigger time'),
    value: 'time',
  },
  {
    name: i18n.t('microService:number of times'),
    value: 'count',
  },
];
const limits = [10, 30, 50];

export default () => {
  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const params = routeInfoStore.useStore((s) => s.params);
  const { serviceName, terminusKey, serviceId } = params;
  const { getExceptionTypes } = topologyServiceStore;
  const [{ sort, limit, exceptionType, exceptionTypes }, updater] = useUpdate({
    exceptionTypes: [] as any[] | undefined,
    exceptionType: undefined as string | undefined,
    sort: undefined as string | undefined,
    limit: undefined as number | undefined,
  });

  useEffect(() => {
    getExceptionTypes({
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      terminusKey,
      start: timeSpan.startTimeMs,
      end: timeSpan.endTimeMs,
    }).then((res) => updater.exceptionTypes(res?.data));
  }, [serviceId, getExceptionTypes, serviceName, terminusKey, timeSpan.endTimeMs, timeSpan.startTimeMs, updater]);

  return (
    <div className="service-analyze flex flex-col h-full">
      <div className="flex justify-between items-center flex-wrap mb-1">
        <div className="left flex justify-between items-center mb-2">
          <TimeSelector className="m-0 mr-3" />
          <Select
            className="mr-3"
            placeholder={i18n.t('microService:select sorting method')}
            allowClear
            style={{ width: '180px' }}
            onChange={(v: any) => updater.sort(v)}
          >
            {sortList.map(({ name, value }) => (
              <Select.Option key={value} value={value}>
                {name}
              </Select.Option>
            ))}
          </Select>
          <Select
            className="mr-3"
            placeholder={i18n.t('microService:maximum number of queries')}
            allowClear
            style={{ width: '180px' }}
            onChange={(v: any) => updater.limit(v)}
          >
            {limits.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
          <Select
            className="mr-3"
            placeholder={i18n.t('microService:exception type')}
            allowClear
            style={{ width: '180px' }}
            onChange={(v: any) => updater.exceptionType(v)}
          >
            {(exceptionTypes || []).map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <ServiceListDashboard dashboardId="exception_analysis" extraGlobalVariable={{ sort, limit, exceptionType }} />
      </div>
    </div>
  );
};

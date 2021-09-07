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
import classNames from 'classnames';
import { Spin, Select } from 'core/nusi';
import { EmptyHolder, useUpdate } from 'common';
import { useLoading } from 'core/stores/loading';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyServiceStore from 'msp/stores/topology-service-analyze';
import ServiceListDashboard from './service-list-dashboard';
import { TimeSelectWithStore } from 'msp/components/time-select';
import { get } from 'lodash';

import './index.scss';

export default () => {
  const _timeSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const { startTimeMs, endTimeMs } = _timeSpan;
  const params = routeInfoStore.useStore((s) => s.params);
  const { terminusKey, serviceName, serviceId } = params;
  const { getProcessDashboardId, getInstanceIds } = topologyServiceStore;
  const [{ id, instanceId, instanceIds, timeSpan }, updater, update] = useUpdate({
    id: undefined as string | undefined,
    instanceId: undefined as string | undefined,
    instanceIds: [] as TOPOLOGY_SERVICE_ANALYZE.InstanceId[] | undefined,
    timeSpan: _timeSpan,
  });
  const [isFetching] = useLoading(topologyServiceStore, ['getProcessDashboardId']);

  useEffect(() => {
    getInstanceIds({
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      terminusKey,
      start: startTimeMs,
      end: endTimeMs,
    }).then((res) => {
      const defaultInstanceId = get(res, ['data', 0, 'instanceId']);
      update({
        timeSpan: _timeSpan,
        instanceId: defaultInstanceId,
        instanceIds: res?.data,
      });
    });
  }, [getInstanceIds, serviceName, terminusKey, endTimeMs, startTimeMs, serviceId, _timeSpan]);

  useEffect(() => {
    getProcessDashboardId({
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      terminusKey,
    }).then((_id) => updater.id(_id));
  }, [serviceId, getProcessDashboardId, serviceName, terminusKey, updater]);

  return (
    <div className="service-analyze flex flex-col h-full">
      <div className="flex justify-between items-center flex-wrap mb-1">
        <div className="left flex justify-between items-center mb-2">
          <Select
            className="mr-3"
            placeholder={i18n.t('addonPlatform:select instance')}
            allowClear
            value={instanceId}
            style={{ width: '300px' }}
            onChange={(v: any) => updater.instanceId(v)}
          >
            {(instanceIds || []).map(({ instanceId: v, status, ip }) => (
              <Select.Option
                key={v}
                value={v}
                title={status ? i18n.t('dcos:running') : i18n.t('microService:not running')}
              >
                <div className="instance-item flex justify-between items-center">
                  <span className="instance-name nowrap">{ip || v}</span>
                  <div className="status ml-2">
                    <span
                      className={classNames({
                        'status-point': true,
                        success: status,
                        grey: !status,
                      })}
                    />
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <TimeSelectWithStore className="m-0 ml-3" />
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <Spin spinning={isFetching}>
          {id ? (
            <ServiceListDashboard timeSpan={timeSpan} dashboardId={id} extraGlobalVariable={{ instanceId }} />
          ) : (
            <EmptyHolder relative />
          )}
        </Spin>
      </div>
    </div>
  );
};

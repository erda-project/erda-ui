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
import { Spin, Select, Tooltip } from 'app/nusi';
import { TimeSelector, EmptyHolder, useUpdate } from 'common';
import { useLoading } from 'common/stores/loading';
import routeInfoStore from 'app/common/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyServiceStore from 'microService/stores/topology-service-analyze';
import ServiceListDashboard from './service-list-dashboard';

import './index.scss';

export default () => {
  const { startTimeMs, endTimeMs } = monitorCommonStore.useStore(s => s.timeSpan);
  const params = routeInfoStore.useStore(s => s.params);
  const { terminusKey, serviceName, serviceId } = params;
  const { getProcessDashboardId, getInstanceIds } = topologyServiceStore;
  const [{ id, instanceId, instanceIds }, updater] = useUpdate({
    id: undefined as string | undefined,
    instanceId: undefined as string | undefined,
    instanceIds: [] as TOPOLOGY_SERVICE_ANALYZE.InstanceId[] | undefined,
  });
  const [isFetching] = useLoading(topologyServiceStore, ['getProcessDashboardId']);

  useEffect(() => {
    getInstanceIds({
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      terminusKey,
      start: startTimeMs,
      end: endTimeMs,
    }).then(res => updater.instanceIds(res?.data));
  }, [getInstanceIds, serviceName, terminusKey, endTimeMs, startTimeMs, updater, serviceId]);

  useEffect(() => {
    getProcessDashboardId({
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      terminusKey,
    }).then(_id => updater.id(_id));
  }, [serviceId, getProcessDashboardId, serviceName, terminusKey, updater]);

  return (
    <div className="service-analyze v-flex-box">
      <div className="flex-box flex-wrap mb4">
        <div className="left flex-box mb8">
          <TimeSelector className="ma0 mr12" />
          <Select
            className="mr12"
            placeholder={i18n.t('addonPlatform:select instance')}
            allowClear
            style={{ width: '300px' }}
            onChange={(v: any) => updater.instanceId(v)}
          >
            {(instanceIds || []).map(({ instanceId: v, status }) => (
              <Select.Option key={v} value={v}>
                <div className="instance-item flex-box">
                  <span className="instance-name nowrap">{v}</span>
                  <Tooltip title={status ? i18n.t('dcos:running') : i18n.t('microService:not running')}>
                    <div className="status ml8">
                      <span className={classNames({
                        'status-point': true,
                        success: status,
                        grey: !status,
                      })}
                      />
                    </div>
                  </Tooltip>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex-1">
        <Spin spinning={isFetching}>
          {id ? <ServiceListDashboard dashboardId={id} extraGlobalVariable={{ instanceId }} /> : <EmptyHolder relative />}
        </Spin>
      </div>
    </div>
  );
};

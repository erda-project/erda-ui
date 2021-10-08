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
import { Select, Dropdown, Menu } from 'core/nusi';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import { ErdaCustomIcon } from 'common';

const { Option } = Select;

export function ServiceNameSelect() {
  const globalTimeSelectSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const [serviceId, serviceName] = serviceAnalyticsStore.useStore((s) => [s.serviceId, s.serviceName]);
  const { startTimeMs, endTimeMs } = globalTimeSelectSpan?.range || {};
  const params = routeInfoStore.useStore((s) => s.params);
  const { updateState } = serviceAnalyticsStore;
  const { getServiceList } = serviceAnalyticsStore;
  const [serviceList, setServiceList] = React.useState([] as any);

  React.useEffect(() => {
    getServiceList({ start: startTimeMs, end: endTimeMs }).then((res) => {
      setServiceList(res?.data || []);
    });
  }, [getServiceList, startTimeMs, endTimeMs]);

  React.useEffect(() => {
    if (params?.serviceId) {
      updateState({
        serviceId: window.decodeURIComponent(params?.serviceId),
      });
    } else if (!serviceId && serviceList?.length > 0) {
      const _serviceName = serviceList?.[0]?.service_name;
      const applicationId = serviceList?.[0]?.application_id;
      updateState({ serviceId: serviceList?.[0]?.service_id, serviceName: _serviceName, applicationId });
    }
  }, [params.serviceId, serviceId, serviceList, updateState]);

  const menu = React.useMemo(() => {
    const handleChangeService = ({ key }: { key: string }) => {
      const service = serviceList.filter((v) => v.service_id === key);
      const _serviceName = service[0]?.service_name;
      const applicationId = service[0]?.application_id;
      updateState({
        serviceId: key,
        serviceName: _serviceName,
        applicationId,
      });
    };
    return (
      <Menu onClick={handleChangeService}>
        {serviceList.map((x: SERVICE_ANALYTICS.ServiceItem) => (
          <Menu.Item
            key={x.service_id}
            className={`${serviceId === x.service_id ? 'bg-light-primary text-primary' : ''}`}
          >
            {x.service_name}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [serviceId]);

  return (
    <div className="mt-2">
      <Dropdown overlay={menu} trigger={['click']}>
        <div className="font-bold text-base h-8 rounded border border-solid border-transparent flex justify-center cursor-pointer">
          <span className="self-center">{serviceName}</span>
          <ErdaCustomIcon className="self-center" type="caret-down" size="16" />
        </div>
      </Dropdown>
    </div>
  );
}

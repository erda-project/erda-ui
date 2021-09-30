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
import { Select } from 'core/nusi';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import serviceAnalyticsStore from 'msp/stores/service-analytics';

const { Option } = Select;

export function ServiceNameSelect() {
  const globalTimeSelectSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const serviceId = serviceAnalyticsStore.useStore((s) => s.serviceId);
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
      const serviceName = serviceList?.[0]?.service_name;
      const applicationId = serviceList?.[0]?.application_id;
      updateState({ serviceId: serviceList?.[0]?.service_id, serviceName, applicationId });
    }
  }, [params.serviceId, serviceId, serviceList, updateState]);

  return (
    <Select
      // Avoid the problem of displaying the id first and then the label
      value={serviceList?.length > 0 ? serviceId : undefined}
      onChange={(value) => {
        const service = serviceList.filter((v) => v.service_id === value);
        const serviceName = service?.service_name;
        const applicationId = service?.application_id;
        updateState({ serviceId: value, serviceName, applicationId });
      }}
      className="mr-3 w-60"
    >
      {serviceList.map((x: SERVICE_ANALYTICS.ServiceItem) => (
        <Option key={x.service_id} value={x.service_id}>
          {x.service_name}
        </Option>
      ))}
    </Select>
  );
}

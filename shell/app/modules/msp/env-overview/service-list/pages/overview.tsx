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
import ServiceListDashboard from './service-list-dashboard';
import { TimeSelectWithStore } from 'msp/components/time-select';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import { EmptyHolder } from 'common';
import './index.scss';

export default () => {
  const serviceId = serviceAnalyticsStore.useStore((s) => s.serviceId);

  return (
    <div className="service-analyze flex flex-col h-full">
      <div className="flex justify-end items-center mb-3">
        <TimeSelectWithStore className="m-0" />
      </div>
      {serviceId ? (
        <div className="overflow-auto flex-1 service-overview">
          <ServiceListDashboard dashboardId="service_analysis-translation" serviceId={serviceId} />
        </div>
      ) : (
        <EmptyHolder relative />
      )}
    </div>
  );
};

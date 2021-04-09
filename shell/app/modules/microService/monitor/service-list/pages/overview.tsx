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

import * as React from 'react';
import ServiceListDashboard from './service-list-dashboard';
import { TimeSelector } from 'common';
import routeInfoStore from 'app/common/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';

export default () => {
  const query = routeInfoStore.useStore(s => s.query);
  const { changeTimeSpan } = monitorCommonStore.reducers;

  if (query && query.start && query.end) {
    changeTimeSpan([+query.start, +query.end]);
  }

  return (
    <div className="service-analyze">
      <div className="flex-box mb12">
        <TimeSelector className="ma0" />
      </div>
      <ServiceListDashboard dashboardId="service_analysis" />
    </div>
  );
};

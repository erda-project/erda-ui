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

import React, { useState, useEffect, useMemo } from 'react';
import { PureBoardGrid } from 'common';
import { DC } from '@terminus/dashboard-configurator';
import monitorCommonStore from 'common/stores/monitorCommon';
import dashboardStore from 'app/common/stores/dashboard';
import routeInfoStore from 'app/common/stores/route';

type IProps = Merge<Partial<DC.PureBoardGridProps>, {
  dashboardId: string,
  extraGlobalVariable?: Record<string, any>,
}>;

const ServiceListDashboard: React.FC<IProps> = ({ dashboardId, extraGlobalVariable, ...rest }) => {
  const timeSpan = monitorCommonStore.useStore(s => s.timeSpan);
  const params = routeInfoStore.useStore(s => s.params);
  const { getCustomDashboard } = dashboardStore;
  const [layout, setLayout] = useState<DC.Layout>([]);

  const globalVariable = useMemo(() => {
    const { serviceName, terminusKey, serviceId } = params;
    const { startTimeMs, endTimeMs } = timeSpan;
    return {
      terminusKey,
      serviceName,
      serviceId: window.decodeURIComponent(serviceId),
      startTime: startTimeMs,
      endTime: endTimeMs,
      ...extraGlobalVariable,
    };
  }, [extraGlobalVariable, params, timeSpan]);

  useEffect(() => {
    getCustomDashboard({ id: dashboardId, isSystem: true }).then(res => {
      setLayout(res);
    });
  }, [dashboardId, getCustomDashboard]);

  return <PureBoardGrid globalVariable={globalVariable} layout={layout} {...rest} />;
};

export default ServiceListDashboard;

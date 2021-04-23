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
import { Search } from 'app/nusi';
import { TimeSelector, PureBoardGrid } from 'common';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { DC } from '@terminus/dashboard-configurator';
import monitorCommonStore from 'common/stores/monitorCommon';
import topologyStore from 'topology/stores/topology';
import routeInfoStore from 'app/common/stores/route';

export default () => {
  const timeSpan = monitorCommonStore.useStore(s => s.timeSpan);
  const params = routeInfoStore.useStore(s => s.params);
  const [layout, setLayout] = useState([]);
  const [serviceName, setServiceName] = useState<string | undefined>(undefined);
  const { getCustomDashboardDetail } = topologyStore.effects;

  const globalVariable = useMemo(() => ({
    terminusKey: params.terminusKey,
    serviceName,
    startTime: timeSpan.startTimeMs,
    endTime: timeSpan.endTimeMs,
  }), [params.terminusKey, serviceName, timeSpan.endTimeMs, timeSpan.startTimeMs]);

  useEffect(() => {
    getCustomDashboardDetail({ id: 'services' }).then(res => {
      setLayout(res);
    });
  }, [getCustomDashboardDetail]);

  const handleBoardEvent = ({ eventName, cellValue, dataSource }: DC.BoardEvent) => {
    if (eventName === 'jumpToDetail') {
      goTo(
        goTo.pages.microServiceServiceAnalyze,
        {
          ...params,
          serviceName: cellValue,
          applicationId: dataSource?.application_id,
          serviceId: window.encodeURIComponent(dataSource?.service_id || ''),
        }
      );
    }
  };

  return (
    <div>
      <div className="mb8 wrap-flex-box">
        <TimeSelector className="mb0" />
        <Search
          allowClear
          placeholder={i18n.t('microService:search by service name')}
          onHandleSearch={(v) => setServiceName(v)}
        />
      </div>
      <PureBoardGrid
        layout={layout}
        globalVariable={globalVariable}
        onBoardEvent={handleBoardEvent}
      />
    </div>
  );
};

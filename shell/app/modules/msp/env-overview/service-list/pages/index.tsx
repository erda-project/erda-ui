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
import { Input } from 'core/nusi';
import { PureBoardGrid } from 'common';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import DC from '@erda-ui/dashboard-configurator/dist';
import topologyStore from 'msp/env-overview/topology/stores/topology';
import routeInfoStore from 'core/stores/route';
import { TimeSelectWithStore } from 'msp/components/time-select';
import monitorCommonStore from 'common/stores/monitorCommon';

const { Search } = Input;

export default () => {
  const { range } = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const params = routeInfoStore.useStore((s) => s.params);
  const [layout, setLayout] = useState([]);
  const [serviceName, setServiceName] = useState<string | undefined>(undefined);
  const { getCustomDashboardDetail } = topologyStore.effects;

  const globalVariable = useMemo(
    () => ({
      terminusKey: params.terminusKey,
      serviceName,
      startTime: range.startTimeMs,
      endTime: range.endTimeMs,
    }),
    [params.terminusKey, serviceName, range],
  );

  useEffect(() => {
    getCustomDashboardDetail({ id: 'services' }).then((res) => {
      setLayout(res);
    });
  }, [getCustomDashboardDetail]);

  const handleBoardEvent = ({ eventName, cellValue, record }: DC.BoardEvent) => {
    if (eventName === 'jumpToDetail') {
      goTo(goTo.pages.mspServiceAnalyze, {
        ...params,
        serviceName: cellValue,
        serviceId: window.encodeURIComponent(record?.service_id || ''),
      });
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between">
        <Search
          allowClear
          placeholder={i18n.t('msp:search by service name')}
          style={{ width: 200 }}
          size="small"
          onSearch={(v) => setServiceName(v)}
        />
        <TimeSelectWithStore />
      </div>
      <PureBoardGrid layout={layout} globalVariable={globalVariable} onBoardEvent={handleBoardEvent} />
    </div>
  );
};

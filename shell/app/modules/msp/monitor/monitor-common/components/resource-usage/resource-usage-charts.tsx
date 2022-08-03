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
import TimeRangeSelector from 'common/components/monitor/components/timeRangeSelector';
import { BoardGrid, Holder } from 'common';
import CommonDashboardStore from 'common/stores/dashboard';
import { useMount } from 'react-use';
import { isEmpty } from 'lodash';

import { useUpdate } from 'common/use-hooks';

import './resource-usage-charts.scss';
const DashBoard = React.memo(BoardGrid.Pure);

interface IProps {
  extraQuery?: object;
  instance: {
    id?: string;
    podUid?: string;
    containerId?: string;
    clusterName?: string;
  };
  type?: string;
  timeSwitch?: boolean;
  api?: string;
}

const ResourceUsageCharts1 = (props: IProps) => {
  const { containerId, podUid } = props?.instance || {};
  const [timeSpan, setTimeSpan] = React.useState({
    startTimeMs: Date.now() - 3600 * 1000,
    endTimeMs: Date.now(),
  });
  const [{ chartLayout }, updater] = useUpdate<{ chartLayout: DC.Layout }>({
    chartLayout: [],
  });
  useMount(() => {
    CommonDashboardStore.getCustomDashboard({
      id: 'runtime-container-detail',
      isSystem: true,
    }).then((res) => updater.chartLayout(res));
  });

  const globalVariable = React.useMemo(
    () => ({
      startTime: timeSpan.startTimeMs,
      endTime: timeSpan.endTimeMs,
      containerId,
      podUid,
    }),
    [timeSpan, podUid, containerId],
  );

  return (
    <div>
      <TimeRangeSelector
        timeSpan={timeSpan}
        onChangeTime={([start, end]) => setTimeSpan({ startTimeMs: start.valueOf(), endTimeMs: end.valueOf() })}
      />
      <Holder when={isEmpty(chartLayout)}>
        <DashBoard layout={chartLayout} globalVariable={globalVariable} />
      </Holder>
    </div>
  );
};

export default ResourceUsageCharts1;

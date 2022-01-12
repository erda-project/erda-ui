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
import { Moment } from 'moment';
import { TimeSelect } from 'common';
import { ITimeRange } from 'common/components/time-select/common';
import monitorCommonStore from 'common/stores/monitorCommon';
import { getTimeSpan } from 'common/utils';

export const TimeSelectWithStore = ({ className, theme }: { className?: string; theme?: 'dark' | 'light' }) => {
  const globalTimeSelectSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan);
  const [time, setTime] = React.useState(globalTimeSelectSpan.data);
  React.useEffect(() => {
    setTime(globalTimeSelectSpan.data);
  }, [globalTimeSelectSpan.data]);
  const handleChange = (data: ITimeRange, range: Moment[]) => {
    const triggerTime = Date.now();
    const span = getTimeSpan(range);
    monitorCommonStore.reducers.updateState({
      globalTimeSelectSpan: {
        ...globalTimeSelectSpan,
        data,
        range: {
          triggerTime,
          ...span,
        },
      },
    });
  };
  const handleChangeStrategy = (strategy: string) => {
    monitorCommonStore.reducers.updateState({
      globalTimeSelectSpan: {
        ...globalTimeSelectSpan,
        refreshStrategy: strategy,
      },
    });
  };
  return (
    <TimeSelect
      value={time}
      className={className}
      onChange={handleChange}
      theme={theme}
      defaultStrategy={globalTimeSelectSpan.refreshStrategy}
      onRefreshStrategyChange={handleChangeStrategy}
    />
  );
};

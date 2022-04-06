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
import { RadioTabs } from 'common';
import { updateSearch } from 'common/utils';
import { MEASURE_TABS } from 'project/tabs';
import TaskSummary from './task-summary';
import IssueDashboard from './issue-dashboard';

const Statistics = () => {
  const [type, setType] = React.useState<string>('task');
  const options = React.useMemo(() => MEASURE_TABS.map((item) => ({ value: item.key, label: item.name })), []);
  return (
    <div>
      <RadioTabs
        options={options}
        value={type}
        onChange={(v: string) => {
          updateSearch({ filter__urlQuery: '' });
          setType(v);
        }}
        className="mb-2"
      />
      {type === 'task' ? <TaskSummary /> : null}
      {type === 'bug' ? <IssueDashboard /> : null}
    </div>
  );
};

export default Statistics;

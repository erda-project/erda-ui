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
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';

const TaskSummary = React.forwardRef(({}, ref) => {
  const [{ projectId, iterationId }] = routeInfoStore.useStore((s) => [s.params]);

  const inParams = { projectId, fixedIteration: iterationId };
  const reloadRef = React.useRef<{ reload: () => void }>(null);

  React.useImperativeHandle(ref, () => ({
    reload: () => {
      reloadRef.current?.reload();
    },
  }));
  return (
    <div>
      <DiceConfigPage
        ref={reloadRef}
        scenarioType={'requirement-task-overview'}
        scenarioKey={'requirement-task-overview'}
        inParams={inParams}
        customProps={{
          topFilter: {
            props: {
              className: 'flex justify-end',
            },
          },
          chartBlock: {
            props: {
              className: 'bg-white',
            },
          },
          stackChartBlock: {
            props: {
              className: 'bg-white',
            },
          },
          container: {
            props: {
              className: 'bg-white',
              leftProportion: 3,
              rightProportion: 7,
            },
          },
          simpleChart: {
            props: {
              style: {
                height: '144px',
              },
            },
          },
        }}
      />
    </div>
  );
});

export default TaskSummary;

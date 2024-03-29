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

const AutoTestPlanList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectId: +projectId,
  };
  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="auto-test-plan-list"
        scenarioType="auto-test-plan-list"
        inParams={inParams}
        customProps={{
          table: {
            props: {
              tableKey: 'auto-test-plan',
            },
          },
        }}
      />
    </div>
  );
};

export default AutoTestPlanList;

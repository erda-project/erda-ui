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
import { K8sClusterTerminalButton } from './cluster-terminal';
import { ClusterContainer } from './index';

const ClusterEnvLog = () => {
  const [{ clusterName }] = routeInfoStore.useStore((s) => [s.params]);

  const inParams = { clusterName };

  return (
    <ClusterContainer>
      <div className="top-button-group">
        <K8sClusterTerminalButton clusterName={clusterName} />
      </div>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-events-list'}
        scenarioKey={'cmp-dashboard-events-list'}
        inParams={inParams}
      />
    </ClusterContainer>
  );
};
export default ClusterEnvLog;

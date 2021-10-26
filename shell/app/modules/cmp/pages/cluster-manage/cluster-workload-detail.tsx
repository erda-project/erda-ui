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

interface IProps {
  clusterName: string;
  workloadId: string;
  podId?: string;
  className?: string;
}
export const PureClusterWorkloadDetail = (props: IProps) => {
  const { clusterName, workloadId, podId, className = '' } = props;

  const inParams = { clusterName, workloadId, podId };
  return (
    <div className={className}>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-workload-detail'}
        scenarioKey={'cmp-dashboard-workload-detail'}
        inParams={inParams}
      />
    </div>
  );
};

export default () => {
  const [{ clusterName, workloadId }, { podId }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const props = { clusterName, workloadId, podId };
  return <PureClusterWorkloadDetail {...props} />;
};

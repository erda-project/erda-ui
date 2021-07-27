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

import React, { useState, useEffect } from 'react';
import i18n from 'i18n';
import DC from '@erda-ui/dashboard-configurator/dist';
import { Icon as CustomIcon, EmptyHolder, PureBoardGrid } from 'common';
import { get, isEmpty } from 'lodash';
import routeInfoStore from 'core/stores/route';
import dashboardStore from 'app/common/stores/dashboard';
import clusterStore from '../../stores/cluster';
import './cluster-state.scss';

export const stateSeverityMap = {
  0: {
    displayName: i18n.t('dcos:healthy'),
    icon: <CustomIcon type="cg" className="health" />,
  },
  1: {
    displayName: i18n.t('dcos:at risk'),
    icon: <CustomIcon type="wks1" className="risk" />,
  },
  2: {
    displayName: i18n.t('dcos:partial failure'),
    icon: <CustomIcon type="wks1" className="part-fault" />,
  },
  3: {
    displayName: i18n.t('dcos:serious failure'),
    icon: <CustomIcon type="wks1" className="serious-fault" />,
  },
};

// 后端说只有四个状态类，是已知并写死的，接口由原先的数组改为对象，key值如下
const clusterStateType = ['dice_addon', 'dice_component', 'kubernetes', 'machine'];

const ClusterState: React.FC<{ clusterName: string }> = ({ clusterName: clusterNameFromProps }) => {
  const { clusterName = clusterNameFromProps } = routeInfoStore.getState((s) => s.params);
  const [clusterStatus, setClusterStatus] = useState<Record<string, any>>({});
  const [dashboardLayout, setDashboardLayout] = useState<DC.Layout>([]);
  const { viewClusterStatus } = clusterStore.effects;
  const { getCustomDashboard } = dashboardStore;

  useEffect(() => {
    if (clusterName) {
      viewClusterStatus({ clusterName }).then((res) => setClusterStatus(res));
      getCustomDashboard({
        id: 'organization_cluster_status',
        isSystem: true,
      }).then((res) => setDashboardLayout(res));
    }
  }, [clusterName, getCustomDashboard, viewClusterStatus]);

  return (
    <div className="v-flex-box">
      <div className="cluster-state-wrapper mb-4">
        {isEmpty(clusterStatus?.components) ? (
          <EmptyHolder />
        ) : (
          <>
            <h3>
              <span className="mr-5">{`${get(clusterStatus, 'displayName', '')}:`}</span>
              <span>
                {get(stateSeverityMap, `${get(clusterStatus, 'status')}.icon`, '')}
                {get(stateSeverityMap, `${get(clusterStatus, 'status')}.displayName`, '')}
              </span>
            </h3>
            <div className="mt-8 left-flex-box cluster-state-content">
              {clusterStateType.map((item) => {
                return (
                  <div className="mb-5 mr-8 cluster-state-item" key={`${item}`}>
                    <span className="text-right cluster-state-item-name">
                      {`${get(clusterStatus, `components.${item}.displayName`, '')}:`}
                    </span>
                    <span className="ml-2 cluster-state-item-detail">
                      <span>
                        {get(stateSeverityMap, `${get(clusterStatus, `components.${item}.status`)}.icon`, '')}
                      </span>
                      <span className="bold">
                        {get(stateSeverityMap, `${get(clusterStatus, `components.${item}.status`)}.displayName`, '')}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="flex-1">
        <PureBoardGrid layout={dashboardLayout} globalVariable={{ clusterName }} />
      </div>
    </div>
  );
};

export default ClusterState;

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
import { Drawer } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { TopButtonGroup } from 'common';
import { PureClusterNodeDetail } from './cluster-nodes-detail';
import { K8sClusterTerminalButton } from './cluster-terminal';
import { ClusterContainer } from './index';

interface IDetailData {
  nodeIP: string;
  nodeId: string;
}
interface IState {
  visible: boolean;
  detailData: null | IDetailData;
}

const ClusterNodes = () => {
  const [{ clusterName }] = routeInfoStore.useStore((s) => [s.params, s.query]);

  const [{ visible, detailData }, updater, update] = useUpdate<IState>({
    visible: false,
    detailData: null,
  });

  const inParams = { clusterName };

  const openDetail = (record: Obj, op: Obj) => {
    if (op.key === 'gotoNodeDetail') {
      const { IP, nodeId } = record;
      update({
        visible: true,
        detailData: { nodeId, nodeIP: IP },
      });
    }
  };

  const closeDetail = () => {
    update({ visible: false, detailData: null });
  };

  const chartProps = {
    grayBg: true,
    size: 'small',
  };

  return (
    <ClusterContainer>
      <TopButtonGroup>
        <K8sClusterTerminalButton clusterName={clusterName} />
      </TopButtonGroup>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-nodes'}
        scenarioKey={'cmp-dashboard-nodes'}
        inParams={inParams}
        customProps={{
          cpuChart: {
            props: chartProps,
          },
          memChart: {
            props: chartProps,
          },
          podChart: {
            props: chartProps,
          },
          table: {
            op: {
              clickTableItem: openDetail,
            },
          },
        }}
      />
      <Drawer visible={visible} onClose={closeDetail} width={'80%'} maskClosable getContainer={false}>
        {visible && detailData ? <PureClusterNodeDetail clusterName={clusterName} {...detailData} /> : null}
      </Drawer>
    </ClusterContainer>
  );
};

export default ClusterNodes;

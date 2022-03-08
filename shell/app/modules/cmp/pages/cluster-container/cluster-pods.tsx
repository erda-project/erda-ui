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
import { Drawer } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { PureClusterPodDetail } from './cluster-pod-detail';
import { ClusterContainer } from './index';

interface IDetailData {
  podId: string;
  podName: string;
  namespace: string;
}

interface IState {
  visible: boolean;
  detailData?: null | IDetailData;
}

const ClusterPods = () => {
  const [{ clusterName }] = routeInfoStore.useStore((s) => [s.params]);
  const [{ visible, detailData }, updater, update] = useUpdate<IState>({
    visible: false,
    detailData: null,
  });
  const reloadRef = React.useRef<Obj | null>(null);

  const inParams = { clusterName };

  const openDetail = (record: Obj, op: Obj) => {
    if (op.key === 'openPodDetail') {
      const { id, namespace, podName } = record || {};
      update({
        visible: true,
        detailData: { podId: id, namespace, podName },
      });
    }
  };

  const closeDetail = () => {
    update({ visible: false, detailData: null });
  };

  const onDeleteDetail = () => {
    closeDetail();
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  const customProps = {
    chartContainer: {
      props: {
        span: [4, 20],
      },
    },
    podsTotal: {
      props: {
        grayBg: true,
        fullHeight: true,
        flexCenter: true,
      },
    },
    podsCharts: {
      props: {
        grayBg: true,
        chartStyle: { width: 32, height: 32, chartSetting: 'start' },
        style: { height: 156, minWidth: 950 },
        textInfoStyle: { width: 110 },
      },
    },
  };

  return (
    <ClusterContainer>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-pods'}
        scenarioKey={'cmp-dashboard-pods'}
        inParams={inParams}
        ref={reloadRef}
        customProps={{
          ...customProps,
          consoleButton: () => <K8sClusterTerminalButton clusterName={clusterName} />,

          podsTable: {
            op: {
              clickTableItem: openDetail,
            },
          },
        }}
      />
      <Drawer visible={visible} getContainer={false} onClose={closeDetail} width={'80%'} maskClosable>
        {visible && detailData ? (
          <PureClusterPodDetail clusterName={clusterName} {...detailData} onDelete={onDeleteDetail} />
        ) : null}
      </Drawer>
    </ClusterContainer>
  );
};

export default ClusterPods;

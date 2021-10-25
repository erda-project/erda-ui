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
import { getUrlQuery } from 'config-page/utils';
import { K8sClusterTerminalButton } from './cluster-terminal';
import { updateSearch } from 'common/utils';
import { Drawer } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { PureClusterPodDetail } from './cluster-pod-detail';

interface IDetailData {
  podId: string;
  podName: string;
  namespace: string;
}

interface IState {
  visible: boolean;
  detailData?: null | IDetailData;
  urlQuery: Obj;
}

const ClusterNodes = () => {
  const [{ clusterName }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [{ visible, detailData, urlQuery }, updater, update] = useUpdate<IState>({
    visible: false,
    detailData: null,
    urlQuery: query,
  });
  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const inParams = { clusterName, ...urlQuery };

  const urlQueryChange = (val: Obj) => updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  const openDetail = (record: Obj) => {
    const { id, namespace, podName } = record || {};
    update({
      visible: true,
      detailData: { podId: id, namespace, podName },
    });
  };

  const closeDetail = () => {
    update({ visible: false, detailData: null });
  };

  return (
    <>
      <div className="top-button-group">
        <K8sClusterTerminalButton clusterName={clusterName} />
      </div>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-pods'}
        scenarioKey={'cmp-dashboard-pods'}
        inParams={inParams}
        customProps={{
          filter: {
            onFilterChange: urlQueryChange,
          },
          podsTable: {
            onStateChange: urlQueryChange,
            clickTableItem: openDetail,
          },
          tableTabs: {
            onStateChange: urlQueryChange,
          },
        }}
      />
      <Drawer visible={visible} getContainer={false} onClose={closeDetail} width={'80%'} maskClosable>
        {visible && detailData ? <PureClusterPodDetail clusterName={clusterName} {...detailData} /> : null}
      </Drawer>
    </>
  );
};

export default ClusterNodes;

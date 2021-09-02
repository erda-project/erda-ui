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
import DiceConfigPage, { useMock } from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import { TimeSelector, MonitorChart } from 'common';
import { Row, Col } from 'core/nusi';
import i18n from 'i18n';

const nodeDetailChartObj = ({ clusterName, nodeId }: { clusterName: string; nodeId: string }) => ({
  cpu: {
    resourceType: 'nodeDetailCpu',
    resourceId: 'cpu',
    chartQuery: {
      customAPIPrefix: '/api/apim/metrics/',
      fetchMetricKey: 'machine_cpu',
      filter_hostname: nodeId,
      filter_cluster_name: clusterName,
      avg: ['cpu_usage_active'],
    },
  },
  mem: {
    resourceType: 'nodeDetailMem',
    resourceId: 'mem',
    chartQuery: {
      customAPIPrefix: '/api/apim/metrics/',
      filter_hostname: nodeId,
      filter_cluster_name: clusterName,
      fetchMetricKey: 'machine_mem',
      avg: ['mem_used_percent'],
    },
  },
});

const ClusterNodes = () => {
  const { clusterName, nodeId } = routeInfoStore.useStore((s) => s.params);

  const inParams = { clusterName, nodeId };

  const queryObj = nodeDetailChartObj({ clusterName, nodeId });

  return (
    <div>
      <div>
        <DiceConfigPage
          scenarioType={'cmp-dashboard-nodeDetail'}
          scenarioKey={'cmp-dashboard-nodeDetail'}
          inParams={inParams}
          forceMock
          useMock={useMock('k8s-node-detail')}
        />
      </div>
      <div className="-mt-8">
        <TimeSelector defaultTime={1} className="mb-8" />
        <Row gutter={20}>
          <Col span={12}>
            <MonitorChart title={i18n.t('cmp:cpu usage rate')} {...queryObj.cpu} />
          </Col>
          <Col span={12}>
            <MonitorChart title={i18n.t('cmp:memory usage rate')} {...queryObj.mem} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ClusterNodes;

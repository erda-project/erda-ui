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

import React, { useState } from 'react';
import { useMount } from 'react-use';
import classnames from 'classnames';
import { set } from 'lodash';
import { Row, Col, Button } from 'app/nusi';
import { IF } from 'common';
import { goTo } from 'common/utils';
import { CLUSTER_INFOS } from 'dcos/common/config';
import i18n from 'i18n';
import clusterStore from 'dataCenter/stores/cluster';
import './cluster-dashboard.scss';

const DD_HOOK_PREFIX = 'https://oapi.dingtalk.com/';

interface IClusterIndices {
  constants: Array<{ key: string; name: string; icon?: string }>;
  dataSource: any;
}

interface IDashboardItem {
  children: React.ReactChild;
  title?: string;
}

interface IClusterIndicesItem {
  icon?: string;
  name: string;
  value: number;
  isErrorValue?: boolean;
  className?: string;
  onClickItem?: () => void;
}

export const DashboardItem = ({ children, title }: IDashboardItem) => {
  return (
    <div className="cluster-dashboard-item mb-8">
      <IF check={title}>
        <div className="dashboard-item-title mb-3">{title}</div>
      </IF>
      {children}
    </div>
  );
};

export const ClusterIndicesItem = ({
  name,
  value,
  className,
  isErrorValue = false,
  onClickItem = () => {},
}: IClusterIndicesItem) => {
  const valueCls = classnames({
    num: true,
    'error-num': isErrorValue,
  });
  return (
    <div className={`cluster-indices-item ${className}`} onClick={onClickItem}>
      <div className="title mb-6">{name}</div>
      <div className={valueCls}>{value}</div>
    </div>
  );
};

export const ClusterIndicesPanel = ({ constants = [], dataSource = {} }: IClusterIndices) => (
  <Row gutter={24}>
    {constants.map(({ key, name, ...rest }) => (
      <Col span={24 / constants.length} key={key}>
        <ClusterIndicesItem name={name} value={dataSource[key]} {...rest} />
      </Col>
    ))}
  </Row>
);

const ClusterDashboard = () => {
  const list = clusterStore.useStore((s) => s.list);
  const { getClusterList } = clusterStore.effects;

  const [addModalVis, setAddModalVis] = useState(false);
  // const [addModalFormData, setAddModalFormData] = useState(null);

  // 企业所有集群的总览信息
  const clustersNum = list.length;

  useMount(() => {
    getClusterList();
  });

  const toggleAddModalVis = () => {
    setAddModalVis(!addModalVis);
  };

  const handleShowAddClusterModal = (record?: any) => {
    if (record) {
      const { urls } = record;
      const { dingDingWarning = '' } = urls || {};
      if (dingDingWarning && dingDingWarning.startsWith(DD_HOOK_PREFIX)) {
        set(record, 'urls', { ...record.urls, dingDingWarning: dingDingWarning.slice(DD_HOOK_PREFIX.length) });
      }
      // setAddModalFormData(record);
    } else {
      // setAddModalFormData(null);
    }
    toggleAddModalVis();
  };

  return (
    <>
      <DashboardItem>
        <ClusterIndicesPanel
          constants={CLUSTER_INFOS}
          dataSource={{
            cluster: clustersNum,
          }}
        />
      </DashboardItem>
      <div className="top-button-group">
        <Button type="primary" onClick={() => handleShowAddClusterModal()}>
          {i18n.t('dcos:add cluster')}
        </Button>
        <Button type="primary" onClick={() => goTo('../addCluster')}>
          {i18n.t('dcos:cluster deployment')}
        </Button>
      </div>
    </>
  );
};

export default ClusterDashboard;

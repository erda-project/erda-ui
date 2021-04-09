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
import { Row, Col } from 'nusi';
import { isEmpty, map } from 'lodash';
import { daysRange } from 'common/utils';
import AlarmChart from './alarm-chart';
import clusterStore from 'dataCenter/stores/cluster';
import userStore from 'app/user/stores';
import { ClusterSelector } from '../../common/components/cluster-selector';

import './index.scss';

// const ALARM_TYPE = {
//   machine: i18n.t('machine'),
//   dice_addon: i18n.t('org:Erda addon'),
//   dice_component: i18n.t('org:Erda component'),
//   kubernetes: 'kubernetes',
// };

const { AlarmTrendChart, AlarmTypeProportionChart, AlarmProportionChart } = AlarmChart;

const AlarmAnalyze = () => {
  const loginUser = userStore.useStore(s => s.loginUser);
  const orgClusterList = clusterStore.useStore(s => s.list);
  const [filterClusters, setFilterClusters] = useState([] as string[]);
  const [fullCluster, setFullCluster] = useState([] as string[]);
  const [listFilter, setListFilter] = useState({});
  // const [filterType, setFilterType] = useState(undefined);
  useEffect(() => {
    clusterStore.effects.getClusterList({ orgId: loginUser.orgId });
    setListFilter({ orgID: loginUser.orgId });
  }, [loginUser]);

  useEffect(() => {
    if (!isEmpty(orgClusterList)) {
      const clusterNames = map(orgClusterList, item => item.name);
      setFullCluster(clusterNames);
      setFilterClusters(clusterNames);
    }
  }, [orgClusterList]);

  const changeCluster = (val: string) => {
    setFilterClusters(val ? [val] : fullCluster);
    setListFilter(val ? { targetID: val } : { orgID: loginUser.orgId });
  };

  const shouldLoad = !isEmpty(filterClusters);
  return (
    <>
      <div className="org-cluster-filter">
        <ClusterSelector clusterList={orgClusterList} onChange={changeCluster} />
      </div>
      <Row>
        <Row>
          <Col>
            <AlarmTrendChart
              query={{
                constQuery: daysRange(7),
                in_cluster_name: filterClusters,
                filter_alert_scope_id: loginUser.orgId,
              }}
              shouldLoad={shouldLoad}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12} style={{ paddingRight: 10 }}>
            <AlarmTypeProportionChart
              query={{
                constQuery: daysRange(7),
                in_cluster_name: filterClusters,
                filter_alert_scope_id: loginUser.orgId,
              }}
              shouldLoad={shouldLoad}
            />
          </Col>
          <Col span={12} style={{ paddingLeft: 10 }}>
            <AlarmProportionChart
              query={{
                constQuery: daysRange(7),
                in_cluster_name: filterClusters,
                filter_alert_scope_id: loginUser.orgId,
              }}
              shouldLoad={shouldLoad}
            />
          </Col>
        </Row>
      </Row>
      {/* <div className="alarm-message">
        <p className="section-title">{i18n.t('org:alarm information')}</p>
        <Select
          className="default-selector-width mb16"
          placeholder={i18n.t('filter by type')}
          allowClear
          onChange={(value) => setFilterType(value as any)}
        >
          {map(ALARM_TYPE, (name, value) => <Select.Option key={value} value={value}>{name}</Select.Option>)}
        </Select>
        <AlarmList query={listFilter} filterType={filterType} />
      </div> */}
    </>
  );
};

export default AlarmAnalyze;

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
import { Row, Col } from 'antd';
import OverviewMap from './config/chartMap';
import TopTabRight from 'service-insight/common/components/tab-right';
import routeInfoStore from 'core/stores/route';
import SICommonStore from '../../stores/common';
import './overview.scss';

const Overview = () => {
  const baseInfo = SICommonStore.useStore((s) => s.baseInfo);
  const serviceName = routeInfoStore.useStore((s) => s.params.serviceName);
  const { applicationId, terminusKey, runtimeName } = baseInfo;
  const query = {
    filter_target_runtime_name: runtimeName,
    filter_target_application_id: applicationId,
    filter_target_service_name: serviceName,
    filter_target_terminus_key: terminusKey,
  };
  const shouldLoad = applicationId !== undefined && serviceName !== undefined;
  return (
    <React.Fragment>
      <TopTabRight />
      <Row className="si-overview">
        <Row>
          <Col>
            <OverviewMap.throughput shouldLoad={shouldLoad} query={query} />
          </Col>
        </Row>
        <Row>
          <Col span={12} style={{ paddingRight: 10 }}>
            <OverviewMap.responseTime shouldLoad={shouldLoad} query={query} />
          </Col>
          <Col span={12} style={{ paddingLeft: 10 }}>
            <OverviewMap.httpState shouldLoad={shouldLoad} query={query} />
          </Col>
        </Row>
      </Row>
    </React.Fragment>
  );
};

export default Overview;

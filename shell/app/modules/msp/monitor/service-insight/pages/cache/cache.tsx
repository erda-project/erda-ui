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
import CacheMap from './config/chartMap';
import { getFilterParams } from 'service-insight/common/utils';
import TopTabRight from 'service-insight/common/components/tab-right';
import monitorCommonStore from 'common/stores/monitorCommon';
import SICommonStore from '../../stores/common';

const Cache = () => {
  const chosenSortItem = monitorCommonStore.useStore((s) => s.chosenSortItem);
  const baseInfo = SICommonStore.useStore((s) => s.baseInfo);
  const { filterQuery, shouldLoad }: any = getFilterParams({ baseInfo } as any, { prefix: 'filter_source_' });
  const chartQuery = chosenSortItem ? { ...filterQuery, filter_db_statement: chosenSortItem } : { ...filterQuery };
  return (
    <div>
      <TopTabRight />
      <Row gutter={20}>
        <Col span={8}>
          <div className="monitor-sort-panel">
            <CacheMap.sortTab />
            <CacheMap.sortList shouldLoad={shouldLoad} query={filterQuery} />
          </div>
        </Col>
        <Col span={16}>
          <CacheMap.responseTimes shouldLoad={shouldLoad} query={chartQuery} />
          <CacheMap.throughput shouldLoad={shouldLoad} query={chartQuery} />
        </Col>
      </Row>
    </div>
  );
};
export default Cache;

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
import { get, map } from 'lodash';
import InstanceSelector from './instanceSelector';
import i18n from 'i18n';
import { IF } from 'common';
import mspStore from 'msp/stores/micro-service';

import './tab-right.scss';
import { TimeSelectWithStore } from 'msp/components/time-select';

// 一层group查询，instance
const instanceGroupHandler = (dataKey: string) => (originData: object) => {
  const results = get(originData, 'results[0].data') || [];
  const data = map(results, (item) => {
    const { tag } = item[dataKey];
    return { value: tag, name: `${i18n.t('instance')}-${tag}` };
  });
  return data;
};

const reqUrlPrefix = '/api/spot/tmc/metrics';

const TabRight = ({ type = '' }: { type?: string }) => {
  const DICE_CLUSTER_TYPE = mspStore.useStore((s) => s.DICE_CLUSTER_TYPE);
  const isDcos = DICE_CLUSTER_TYPE === 'dcos';
  const modulesMap = {
    jvm: {
      api: `${reqUrlPrefix}/jvm_memory`,
      query: {
        latestTimestamp: 'usage_percent',
        sort: ['count', 'latestTimestamp_usage_percent'],
        group: isDcos ? ['instance_id'] : ['service_ip'],
      },
      dataHandler: instanceGroupHandler('latestTimestamp.usage_percent'),
    },
    node: {
      api: `${reqUrlPrefix}/nodejs_memory`,
      query: {
        latestTimestamp: 'heap_total',
        sort: ['count', 'latestTimestamp_heap_total'],
        group: isDcos ? ['instance_id'] : ['service_ip'],
      },
      dataHandler: instanceGroupHandler('latestTimestamp.heap_total'),
    },
  };
  return (
    <div className="si-top-nav-right filter-box flex justify-between">
      <div>
        <IF check={['jvm', 'node'].includes(type)}>
          <InstanceSelector {...modulesMap[type]} type={type} />
        </IF>
      </div>
      <TimeSelectWithStore />
    </div>
  );
};

export default TabRight;

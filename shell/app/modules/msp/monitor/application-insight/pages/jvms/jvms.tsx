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
import { Row, Col } from 'core/nusi';
import JvmsMap from './config/chartMap';
import TopTabRight from 'application-insight/common/components/tab-right';
import monitorCommonStore from 'common/stores/monitorCommon';

const PageMap = [
  [JvmsMap.heapMemoryUsage, JvmsMap.nonHeapMemoryUsage],
  [JvmsMap.PSEdenSpace, JvmsMap.PSOldGen, JvmsMap.PSSurvivorSpace],
  [JvmsMap.GCMarkSweep, JvmsMap.GCScavenge],
  [JvmsMap.classCount, JvmsMap.thread],
];

const Jvms = () => {
  const type = 'jvm';
  const chosenModule = monitorCommonStore.useStore((s) => s.chosenModule);
  const curChosen = chosenModule[type];

  const opt = curChosen ? { query: { filter_instance_id: curChosen } } : { shouldLoad: false };
  return (
    <div>
      <TopTabRight type={type} />
      {PageMap.map((cols, rIndex) => (
        <Row gutter={20} key={String(rIndex)}>
          {cols.map((Chart, cIndex) => {
            const spanWidth = 24 / cols.length;
            return (
              <Col span={spanWidth} key={String(cIndex)}>
                <Chart {...opt} />
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
};

export default Jvms;

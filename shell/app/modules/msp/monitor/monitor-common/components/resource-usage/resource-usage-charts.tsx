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
import { Col, Row } from 'antd';
import TimeRangeSelector from 'common/components/monitor/components/timeRangeSelector';
import ChartMap from './config';
import './resource-usage-charts.scss';
import { omit } from 'lodash';

type ChartType = keyof ReturnType<typeof ChartMap>;

interface IProps {
  extraQuery?: object;
  instance: {
    id?: string;
    podUid?: string;
    containerId?: string;
    clusterName?: string;
  };
  type?: string;
  timeSwitch?: boolean;
  api?: string;
}

const ResourceUsageCharts = (props: IProps) => {
  const { instance, extraQuery = {}, api } = props;
  const { id, containerId } = instance;
  const type = containerId ? 'container' : 'instance';
  const chartMapConfig = ChartMap(api);

  const PageMap = [
    [
      {
        Chart: chartMapConfig.containerMem,
        key: 'containerMem',
      },
      {
        Chart: chartMapConfig.containerCpu,
        key: 'containerCpu',
      },
    ],
    [
      {
        Chart: chartMapConfig.containerIo,
        key: 'containerIo',
      },
      {
        Chart: chartMapConfig.containerNet,
        key: 'containerNet',
      },
    ],
  ];
  const [timeSpan, setTimeSpan] = React.useState({
    startTimeMs: Date.now() - 3600 * 1000,
    endTimeMs: Date.now(),
  });
  const paramObj = {
    container: {
      filter_container_id: containerId,
      ...extraQuery,
      start: timeSpan.startTimeMs,
      end: timeSpan.endTimeMs,
    },
    instance: { filter_instance_id: id, ...extraQuery, start: timeSpan.startTimeMs, end: timeSpan.endTimeMs },
  };

  const queryConvert = React.useCallback(
    (data: Obj, chartType: ChartType) => {
      if (chartType === 'containerNet' && type === 'container' && instance.podUid) {
        return {
          ...omit(data, 'filter_container_id'),
          filter_pod_uid: instance.podUid,
        };
      }
      return data;
    },
    [instance, type],
  );

  return (
    <div className="unit-detail">
      <TimeRangeSelector
        timeSpan={timeSpan}
        onChangeTime={([start, end]) => setTimeSpan({ startTimeMs: start.valueOf(), endTimeMs: end.valueOf() })}
      />
      {PageMap.map((cols, rIndex) => (
        <Row gutter={20} key={String(rIndex)}>
          {cols.map(({ Chart, key }: any, cIndex: number) => {
            const spanWidth = 24 / cols.length;
            const query = queryConvert(paramObj[type], key);
            return (
              <Col span={spanWidth} key={String(cIndex)}>
                <Chart query={query} />
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
};

export default ResourceUsageCharts;

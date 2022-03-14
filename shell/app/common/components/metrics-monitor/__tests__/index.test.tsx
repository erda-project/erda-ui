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
import { act, render } from '@testing-library/react';
import MonitorChartPanel from '..';
import metricsMonitorStore from 'common/stores/metrics';

jest.mock('common/components/monitor/monitor-chart-panel', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const PureMonitorChartPanel = ({ metrics, ...rest }) => {
    return (
      <div className="mock-monitor-chart-panel">
        <div>{JSON.stringify(metrics)}</div>
        <div>{JSON.stringify(rest)}</div>
      </div>
    );
  };
  return PureMonitorChartPanel;
});
describe('MonitorChartPanel', () => {
  const resultData: METRICS.ChartMeta = {
    resourceType: 'application',
    metrics: {
      data: [
        {
          name: 'ui',
          data: [
            {
              name: 'erda-ui',
            },
          ],
        },
        {
          name: 'server',
          data: [
            {
              name: 'erda-server',
            },
          ],
        },
      ],
    },
  };
  const listMetricByResourceType = metricsMonitorStore.effects.listMetricByResourceType;
  const clearListMetrics = metricsMonitorStore.reducers.clearListMetrics;
  afterAll(() => {
    metricsMonitorStore.effects.listMetricByResourceType = listMetricByResourceType;
    metricsMonitorStore.reducers.clearListMetrics = clearListMetrics;
    jest.resetAllMocks();
  });
  it('should work well', () => {
    jest.useFakeTimers();
    const baseProps = {
      resourceType: 'application',
    };
    metricsMonitorStore.effects.listMetricByResourceType = jest.fn();
    metricsMonitorStore.reducers.clearListMetrics = jest.fn();
    const result = render(<MonitorChartPanel {...baseProps} />);
    expect(metricsMonitorStore.effects.listMetricByResourceType).toHaveBeenLastCalledWith({
      resourceType: baseProps.resourceType,
    });
    expect(result.getByText('no data')).toBeTruthy();
    act(() => {
      metricsMonitorStore.reducers.listMetricByResourceTypeSuccess(resultData);
      jest.runAllTimers();
    });
    expect(result.container).isExit('.mock-monitor-chart-panel', 1);
    result.unmount();
    expect(metricsMonitorStore.reducers.clearListMetrics).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

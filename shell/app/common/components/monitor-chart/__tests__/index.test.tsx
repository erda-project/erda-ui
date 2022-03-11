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
import { render } from '@testing-library/react';
import metricsMonitorStore from 'common/stores/metrics';
import MonitorChart from '..';

jest.mock('common/components/monitor/monitor-chart', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const PureMonitorChart = () => {
    return <div className="mock-pure-monitor-chart">PureMonitorChart</div>;
  };
  return PureMonitorChart;
});
describe('MonitorChart', () => {
  const loadMetricItem = metricsMonitorStore.effects.loadMetricItem;
  beforeAll(() => {
    jest.resetAllMocks();
    metricsMonitorStore.effects.loadMetricItem = loadMetricItem;
  });
  it('should work well', () => {
    metricsMonitorStore.effects.loadMetricItem = jest.fn();
    render(<MonitorChart resourceType="type" resourceId="id" metricKey={'key'} chartQuery={{ id: 1 }} />);
    expect(metricsMonitorStore.effects.loadMetricItem).toHaveBeenCalled();
  });
});

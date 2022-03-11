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
import { fireEvent, render } from '@testing-library/react';
import MonitorChartPanel from '../monitor-chart-panel';
import MonitorChart from 'common/components/monitor-chart';

jest.mock('common/components/monitor-chart');
describe('MonitorChartPanel', () => {
  beforeAll(() => {
    (MonitorChart as unknown as jest.MockInstance<any, any>).mockImplementation((props) => {
      return <div className="mock-monitor-chart">{JSON.stringify(props)}</div>;
    });
  });
  const resourceId = '123';
  const resourceType = 'addon';
  it('render without resourceType', () => {
    const result = render(<MonitorChartPanel resourceId={resourceId} defaultTime={1} />);
    expect(result.container.firstChild).toBeNull();
  });
  it('render without resourceId', () => {
    const result = render(<MonitorChartPanel resourceType={resourceType} />);
    expect(result.container.firstChild).toBeNull();
  });
  it('render with metrics length less than 4', () => {
    const metrics = {
      a: { name: 'a', parameters: { a: 1 } },
      b: { name: 'b' },
      c: { name: 'c' },
      d: { name: 'd' },
    };
    const result = render(<MonitorChartPanel resourceType={resourceType} resourceId={resourceId} metrics={metrics} />);
    expect(result.container).isExit('.mock-monitor-chart', 4);
    expect(result.queryByText('load more')).toBeNull();
  });
  it('render with metrics length greater than 4', () => {
    const metrics = {
      a: { name: 'a' },
      b: { name: 'b' },
      c: { name: 'c' },
      d: { name: 'd' },
      e: { name: 'e' },
      f: { name: 'f' },
      g: { name: 'g' },
      h: { name: 'h' },
      i: { name: 'i' },
    };
    const result = render(<MonitorChartPanel resourceType="a" resourceId="a" metrics={metrics} />);
    expect(result.container).isExit('.mock-monitor-chart', 4);
    expect(result.queryByText('load more')).not.toBeNull();
    fireEvent.click(result.getByText('load more'));
    expect(result.container).isExit('.mock-monitor-chart', 8);
  });
});

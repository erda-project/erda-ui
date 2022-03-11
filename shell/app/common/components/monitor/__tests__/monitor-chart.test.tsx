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
import { getTimeSpan } from 'common/utils';
import MonitorChart from '../monitor-chart';

jest.mock('charts', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const Chart = jest.requireActual('charts');
  const MonitorChartNew = (props) => {
    return (
      <div className="mock-monitor-chart-new">
        {Object.keys(props).map((item) => {
          return (
            <div key={item} className={item}>
              {JSON.stringify(props[item])}
            </div>
          );
        })}
      </div>
    );
  };
  return {
    ...Chart,
    MonitorChartNew,
  };
});
describe('MonitorChart', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should render normally', () => {
    const timeSpan = getTimeSpan();
    const title = 'PureMonitorChart title';
    const data = {
      data: [1],
    };
    const result = render(<MonitorChart title={title} timeSpan={timeSpan} />);
    expect(result.getByText(title)).toBeTruthy();
    result.rerender(<MonitorChart title={title} timeSpan={timeSpan} data={data} />);
    expect(result.getByText(JSON.stringify(data))).toBeTruthy();
  });
});

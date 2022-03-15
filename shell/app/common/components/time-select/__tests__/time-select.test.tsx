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
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { resetMockDate, setMockDate } from 'test/utils';
import { autoRefreshDuration, relativeTimeRange } from '../utils';
import TimeSelect from '..';

describe('TimeSelect', () => {
  it('should render well', () => {
    const changeFn = jest.fn();
    const result = render(
      <TimeSelect
        onChange={changeFn}
        triggerChangeOnMounted
        defaultValue={{ mode: 'quick', quick: 'days:1', customize: {} }}
      />,
    );
    expect(result.getByText('last 1 days')).toBeTruthy();
    expect(changeFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.container.querySelector('[name="refresh1"]')!);
    expect(changeFn).toHaveBeenCalledTimes(2);
    result.rerender(
      <TimeSelect
        onChange={changeFn}
        triggerChangeOnMounted
        value={{ mode: 'quick', quick: 'days:3', customize: {} }}
      />,
    );
    expect(result.getByText('last 3 days')).toBeTruthy();
  });
  it('should auto refresh', async () => {
    jest.useFakeTimers();
    const changeFn = jest.fn();
    const changeStrategyFn = jest.fn();
    const result = render(<TimeSelect onChange={changeFn} onRefreshStrategyChange={changeStrategyFn} />);
    fireEvent.mouseDown(result.getByText('OFF'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText(autoRefreshDuration['seconds:5']));
    expect(changeStrategyFn).toHaveBeenLastCalledWith('seconds:5');
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(changeFn).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
  it('should TimeRange work well with relativeTimeRange', async () => {
    setMockDate();
    const changeFn = jest.fn();
    const result = render(<TimeSelect onChange={changeFn} value={{}} />);
    fireEvent.click(result.container.querySelector('.time-range')!);
    await waitFor(() => expect(result.baseElement).isExit('.time-range-dropdown', 1));
    fireEvent.click(result.getByText(relativeTimeRange['days:3']));
    expect(changeFn).toHaveBeenCalledTimes(1);
    expect(changeFn.mock.calls[0][0]).toStrictEqual({
      customize: { end: undefined, start: undefined },
      mode: 'quick',
      quick: 'days:3',
    });
    result.rerender(<TimeSelect onChange={changeFn} />);
    fireEvent.click(result.container.querySelector('.time-range')!);
    await waitFor(() => expect(result.baseElement).isExit('.time-range-dropdown', 1));
    fireEvent.click(result.getByText(relativeTimeRange['days:1']));
    expect(changeFn).toHaveBeenCalledTimes(2);
    expect(changeFn.mock.calls[1][0]).toStrictEqual({
      customize: { end: undefined, start: undefined },
      mode: 'quick',
      quick: 'days:1',
    });
    resetMockDate();
  });
  it('should TimeRange work well with absoluteTimeRange', async () => {
    setMockDate();
    const changeFn = jest.fn();
    const result = render(<TimeSelect onChange={changeFn} value={{ mode: 'quick', quick: 'days:1' }} />);
    fireEvent.click(result.container.querySelector('.time-range')!);
    await waitFor(() => expect(result.baseElement).isExit('.time-range-dropdown', 1));
    const [startTime] = result.getAllByPlaceholderText('Select date');
    expect(result.getAllByPlaceholderText('Select date')).toHaveLength(2);
    fireEvent.mouseDown(startTime);
    fireEvent.focus(startTime);
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-panel-container', 1));
    fireEvent.click(result.getByText('Now'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-panel-container', 2));
    fireEvent.click(result.getAllByText('Now')[1]);
    expect(changeFn).toHaveBeenCalledTimes(1);
    resetMockDate();
  });
});

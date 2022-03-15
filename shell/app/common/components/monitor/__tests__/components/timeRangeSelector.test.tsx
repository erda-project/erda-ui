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
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { resetMockDate, setMockDate } from 'test/utils';
import { getTimeSpan } from 'common/utils';
import TimeRangeSelector from '../../components/timeRangeSelector';

describe('TimeRangeSelector', () => {
  const start = 1647326519570;
  const end = 1647327019570;
  const timeSpan = getTimeSpan([start, end]);
  it('should render well', () => {
    const changeFn = jest.fn();
    const result = render(
      <TimeRangeSelector timeSpan={timeSpan} defaultTime={1} onChangeTime={changeFn} query={{ start, end }} />,
    );
    expect(result.container.firstChild).toHaveClass('monitor-time-selector');
    expect(changeFn).toHaveBeenLastCalledWith([start, end]);
    result.rerender(
      <TimeRangeSelector
        inline
        timeSpan={getTimeSpan([start + 1000, end])}
        defaultTime={1}
        onChangeTime={changeFn}
        query={{ start, end }}
      />,
    );
    expect(result.container.firstChild).toHaveClass('monitor-time-selector-inline');
  });
  it('should work well', async () => {
    setMockDate();
    const changeFn = jest.fn();
    const disabledDateFn = jest.fn();
    const result = render(
      <TimeRangeSelector timeSpan={timeSpan} defaultTime={1} onChangeTime={changeFn} query={{ start, end }} />,
    );
    expect(changeFn).toHaveBeenCalledTimes(1);
    fireEvent.mouseDown(result.getByPlaceholderText('start at'));
    fireEvent.focus(result.getByPlaceholderText('start at'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-range-wrapper', 1));
    fireEvent.click(result.getByText('7day'));
    expect(changeFn).toHaveBeenCalledTimes(2);
    result.rerender(
      <TimeRangeSelector
        timeSpan={timeSpan}
        defaultTime={1}
        onChangeTime={changeFn}
        query={{ start, end }}
        disabledDate={disabledDateFn}
      />,
    );
    fireEvent.mouseDown(result.getByPlaceholderText('start at'));
    fireEvent.focus(result.getByPlaceholderText('start at'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-range-wrapper', 1));
    expect(disabledDateFn).toHaveBeenCalled();
    resetMockDate();
  });
});

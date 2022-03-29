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
import { resetMockDate, setMockDate } from 'test/utils';
import CommonRangePicker from '..';

describe('CommonRangePicker', () => {
  it('should work well', async () => {
    const mockDate = setMockDate();
    const today = mockDate.moment;
    const yesterday = mockDate.moment.subtract(1, 'day');
    const okFn = jest.fn();
    const result = render(<CommonRangePicker onOk={okFn} defaultTime={[yesterday, today]} />);
    fireEvent.mouseDown(result.getByPlaceholderText('start at'));
    fireEvent.focus(result.getByPlaceholderText('start at'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-range-wrapper', 1));
    fireEvent.click(result.getByText('7day'));
    expect(okFn).toHaveBeenCalled();
    resetMockDate();
  });
});

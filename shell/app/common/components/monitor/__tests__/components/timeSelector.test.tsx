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
import TimeSelector from '../../components/timeSelector';

describe('TimeSelector', () => {
  it('should render well with defaultTime', () => {
    const changeFn = jest.fn();
    const result = render(<TimeSelector defaultTime={1} onChangeTime={changeFn} timeSpan={{ hours: 2 }} />);
    expect(result.container.firstChild).toHaveClass('monitor-time-selector');
    expect(changeFn).toHaveBeenLastCalledWith(1);
  });
  it('should render well without defaultTime', () => {
    const changeFn = jest.fn();
    const result = render(<TimeSelector onChangeTime={changeFn} timeSpan={{ hours: 2 }} inline />);
    expect(result.container.firstChild).toHaveClass('monitor-time-selector-inline');
    expect(changeFn).toHaveBeenLastCalledWith(2);
  });
  it('should work well', async () => {
    const changeFn = jest.fn();
    const result = render(<TimeSelector onChangeTime={changeFn} timeSpan={{ hours: 3 }} inline />);
    expect(changeFn).toHaveBeenLastCalledWith(3);
    fireEvent.mouseDown(result.getByText('3changes in the hour'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('3changes in the day'));
    expect(changeFn).toHaveBeenLastCalledWith('72');
  });
});

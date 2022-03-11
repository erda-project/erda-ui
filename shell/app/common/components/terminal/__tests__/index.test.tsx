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
import * as xterm from 'common/utils/xterm';
import Terminal from '..';

describe('Terminal', () => {
  it('should work well', () => {
    jest.useFakeTimers();
    const fitFn = jest.fn();
    const spyOnCreateTerm = jest.spyOn(xterm, 'createTerm').mockImplementation(() => ({
      fit: fitFn,
    }));
    const spyOnDestroyTerm = jest.spyOn(xterm, 'destroyTerm').mockImplementation(() => {});
    spyOnDestroyTerm.mockImplementation(() => {});
    const params = { name: 'erda', id: 1 };
    const result = render(<Terminal params={params} />);
    jest.runAllTimers();
    expect(spyOnCreateTerm).toHaveBeenCalled();
    expect(spyOnCreateTerm.mock.calls[0][1]).toStrictEqual(params);
    fireEvent.click(result.getByText('full screen'));
    expect(result.getByText('exit full screen')).toBeTruthy();
    expect(fitFn).toHaveBeenCalled();
    result.unmount();
    expect(spyOnDestroyTerm).toHaveBeenCalled();
    spyOnCreateTerm.mockRestore();
    spyOnDestroyTerm.mockRestore();
    jest.useRealTimers();
  });
});

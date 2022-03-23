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
import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Ellipsis from '..';

describe('Ellipsis', () => {
  const setDomBounding = (data: Partial<HTMLElement>) => {
    Object.keys(data ?? {}).forEach((prop) => {
      Object.defineProperty(HTMLElement.prototype, prop, {
        configurable: true,
        writable: true,
        value: data[prop],
      });
    });
  };
  const title = 'this is a very long text';
  const triggerEvent = (result: RenderResult) => {
    act(() => {
      fireEvent.mouseEnter(result.getByText(title));
      jest.runAllTimers();
      userEvent.hover(result.container.querySelector('.truncate')!);
    });
  };
  it('should work well', async () => {
    jest.useFakeTimers();
    const result = render(<Ellipsis title={title} />);
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).not.toBeInTheDocument());
    setDomBounding({ offsetWidth: 200, scrollWidth: 199, clientWidth: 200 });
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).not.toBeInTheDocument());
    setDomBounding({ offsetWidth: 100, scrollWidth: 200, clientWidth: 100 });
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).toBeInTheDocument());
    expect(result.getAllByText(title)).toHaveLength(2);
    jest.useRealTimers();
  });
});

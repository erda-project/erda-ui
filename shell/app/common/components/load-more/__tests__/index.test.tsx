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
import { act, fireEvent, render } from '@testing-library/react';
import LoadMore from '..';

describe('LoadMore', () => {
  it('should render well', () => {
    const result = render(<LoadMore isLoading={false} load={() => {}} />);
    expect(result.container.firstChild).toBeNull();
    result.rerender(<LoadMore isLoading load={() => {}} />);
    expect(result.getByText(/loading/)).toBeTruthy();
  });
  it('should init load', () => {
    const loadFn = jest.fn();
    render(
      <LoadMore
        isLoading={false}
        triggerBy="scroll"
        threshold={300}
        load={loadFn}
        initialLoad
        getContainer={() => document.body}
      />,
    );
    expect(loadFn).toHaveBeenCalled();
  });
  it('should work well', () => {
    const eventMap = {};
    const spyOnDispatchEvent = jest.spyOn(window, 'dispatchEvent');
    const spyOnAddEventListener = jest.spyOn(window, 'addEventListener');
    spyOnAddEventListener.mockImplementation((type: string, listener: EventListenerOrEventListenerObject) => {
      if (eventMap[type]) {
        eventMap[type].push(listener);
      } else {
        eventMap[type] = [listener];
      }
    });
    spyOnDispatchEvent.mockImplementation((e: Event) => {
      const events = eventMap[e.type] || [];
      const preventDefault = jest.fn();
      events.forEach((event: Function) => {
        event({ ...e, preventDefault });
      });
      return true;
    });
    jest.useFakeTimers();
    const div = document.createElement('div', {});
    div.id = 'main';
    div.style.height = '400px';
    div.style.overflowY = 'auto';
    const loadFn = jest.fn();
    const result = render(<LoadMore load={loadFn} hasMore={false} isLoading={false} />, {
      container: document.body.appendChild(div),
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
      jest.runAllTimers();
    });
    expect(loadFn).not.toHaveBeenCalled();
    window.dispatchEvent({ type: 'mousewheel', deltaY: 1 });
    result.rerender(<LoadMore load={loadFn} hasMore={false} isLoading />);
    result.rerender(<LoadMore load={loadFn} hasMore isLoading={false} />);
    // jest.advanceTimersByTime(200);
    expect(loadFn).toHaveBeenCalledTimes(1);
    fireEvent.scroll(div);
    expect(loadFn).toHaveBeenCalledTimes(2);
    expect(loadFn).toHaveBeenCalledTimes(2);
    result.rerender(<LoadMore load={loadFn} hasMore={false} isLoading />);
    spyOnAddEventListener.mockRestore();
    spyOnDispatchEvent.mockRestore();
  });
});

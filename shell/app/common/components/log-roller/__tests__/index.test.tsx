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
import WrappedLogRoller from '..';
import { fireEvent, render, waitFor } from '@testing-library/react';
import commonStore from 'common/stores/common';
import { flushPromises } from 'test/utils';

describe('WrappedLogRoller', () => {
  const content = [
    {
      source: 'log content',
      id: 'log-erda-2021-06-29',
      stream: 'stdout',
      timeBucket: '1624954155',
      timestamp: 1624954155,
      offset: '408',
      content: '2021-06-29T11:05:45.713Z INFO - [erda-log-content]',
      level: 'INFO',
      requestId: 'r-2021-06-29',
    },
    {
      source: 'log content',
      id: 'log-erda-2021-06-29',
      stream: 'stdout',
      timeBucket: '1624954155350947968',
      timestamp: 1624954155350,
      offset: '408',
      content: '2021-06-29T11:05:45.713Z INFO - [erda-log-content]',
      level: 'INFO',
      requestId: 'r-2021-06-29',
    },
    {
      source: 'log content',
      id: 'log-erda-2021-06-29',
      stream: 'stdout',
      timeBucket: '1624954155390947968',
      timestamp: 1624954155390947968,
      offset: '408',
      content: '2021-06-29T11:05:45.713Z INFO - [erda-log-content]',
      level: 'INFO',
      requestId: 'r-2021-06-29',
    },
  ];
  const setDomBounding = (scrollHeight: number, scrollTop: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      writable: true,
      value: scrollTop,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: clientHeight,
    });
  };
  const originFetchLog = commonStore.effects.fetchLog;
  const originClearLog = commonStore.reducers.clearLog;
  const originUseSore = commonStore.useStore;
  const logKey = 'erda-log';
  const mockFn = () => {
    const fetchLog = jest.fn().mockResolvedValue({});
    const clearLog = jest.fn();
    commonStore.effects.fetchLog = fetchLog;
    commonStore.reducers.clearLog = clearLog;
    return {
      fetchLog,
      clearLog,
    };
  };
  afterAll(() => {
    commonStore.effects.fetchLog = originFetchLog;
    commonStore.reducers.clearLog = originClearLog;
    commonStore.useStore = originUseSore;
  });
  it('should work well', async () => {
    jest.useFakeTimers('legacy');
    const { fetchLog, clearLog } = mockFn();
    const result = render(<WrappedLogRoller logKey={logKey} />);
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(2);
    jest.runAllTimers();
    expect(fetchLog).toHaveBeenCalledTimes(3);
    commonStore.useStore = (fn) =>
      fn({
        logsMap: {
          [logKey]: {
            content,
            emptyTimes: 1,
            fetchPeriod: 3,
          },
        },
        slidePanelComps: [],
      });
    result.rerender(<WrappedLogRoller logKey={logKey} />);
    setDomBounding(1000, 200, 700);
    fireEvent.click(result.getByText('back to top'));
    expect(fetchLog).toHaveBeenCalledTimes(4);
    // multiple clicks trigger only once
    fireEvent.click(result.getByText('back to top'));
    expect(fetchLog).toHaveBeenCalledTimes(4);
    fireEvent.click(result.getByText('download log'));
    await waitFor(() => expect(result.queryByText('log download')).not.toBeNull());
    result.unmount();
    expect(clearLog).toHaveBeenLastCalledWith(logKey);
    jest.useRealTimers();
  });
  it('should work with searchContext', async () => {
    jest.useFakeTimers('legacy');
    const { fetchLog } = mockFn();
    render(<WrappedLogRoller logKey={logKey} searchContext="erda-log-content" />);
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
  it('should work well query', async () => {
    jest.useFakeTimers('legacy');
    const { fetchLog } = mockFn();
    const result = render(
      <WrappedLogRoller logKey={logKey} query={{ requestId: 1, end: true }} filter={{ name: 'erda-ui' }} />,
    );
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    await flushPromises();
    expect(fetchLog).toHaveBeenCalledTimes(1);
    result.rerender(<WrappedLogRoller logKey={logKey} query={{ requestId: 1 }} pause />);
    fireEvent.click(result.getByText('start'));
    jest.useRealTimers();
  });
});

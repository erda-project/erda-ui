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
import { IProps, LogRoller } from '../log-roller';
import { fireEvent, render } from '@testing-library/react';

describe('LogRoller', () => {
  const setDomBounding = (scrollHeight: number, scrollTop: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      value: scrollTop,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: clientHeight,
    });
  };
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
  const setUp = (props?: Partial<IProps>) => {
    const goToTopFn = jest.fn();
    const goToBottomFn = jest.fn();
    const showDownloadModalFn = jest.fn();
    const cancelRollingFn = jest.fn();
    const startRollingFn = jest.fn();
    const Comp = (compProps: IProps) => (
      <LogRoller
        content={content}
        {...compProps}
        onGoToTop={goToTopFn}
        onGoToBottom={goToBottomFn}
        onShowDownloadModal={showDownloadModalFn}
        onCancelRolling={cancelRollingFn}
        onStartRolling={startRollingFn}
      />
    );
    const result = render(<Comp {...(props as Required<IProps>)} />);
    const rerender = (newProps: Partial<IProps>) => {
      result.rerender(<Comp {...(newProps as Required<IProps>)} />);
    };
    return {
      result,
      rerender,
      goToTopFn,
      goToBottomFn,
      showDownloadModalFn,
      cancelRollingFn,
      startRollingFn,
    };
  };
  it('should work well', () => {
    const { result, rerender, cancelRollingFn, startRollingFn, showDownloadModalFn, goToTopFn, goToBottomFn } = setUp();
    expect(result.queryByText('download log')).toBeNull();
    fireEvent.click(result.getByText('back to bottom'));
    expect(goToBottomFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.getByText('back to top'));
    expect(goToTopFn).toHaveBeenCalledTimes(1);
    expect(result.queryByText('exit full screen')).toBeNull();
    expect(result.queryByText('full screen')).not.toBeNull();
    fireEvent.click(result.getByText('full screen'));
    expect(result.queryByText('exit full screen')).not.toBeNull();
    expect(result.queryByText('full screen')).toBeNull();
    fireEvent.click(result.getByText('exit full screen'));
    expect(result.queryByText('exit full screen')).toBeNull();
    expect(result.queryByText('full screen')).not.toBeNull();
    fireEvent.click(result.getByText('start'));
    expect(startRollingFn).toHaveBeenCalledTimes(1);
    rerender({ rolling: true });
    fireEvent.click(result.getByText('pause'));
    expect(cancelRollingFn).toHaveBeenCalledTimes(1);
    rerender({ hasLogs: true });
    expect(result.queryByText('download log')).not.toBeNull();
    fireEvent.click(result.getByText('download log'));
    expect(showDownloadModalFn).toHaveBeenCalledTimes(1);
    rerender({ backwardLoading: true });
    expect(result.container).isExit('[name="loading"]', 1);
    rerender({ extraButton: <button className="extra-button">extraButton</button> });
    expect(result.container).isExit('.extra-button', 1);
  });
  it('should scroll well', () => {
    jest.useFakeTimers();
    const { result, goToTopFn, cancelRollingFn } = setUp({
      rolling: true,
    });
    setDomBounding(1000, 200, 700);
    fireEvent.scroll(result.container.querySelector('.log-content-wrap')!);
    jest.runAllTimers();
    expect(cancelRollingFn).toHaveBeenCalledTimes(1);
    setDomBounding(1000, 0, 700);
    fireEvent.scroll(result.container.querySelector('.log-content-wrap')!);
    jest.runAllTimers();
    expect(goToTopFn).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});

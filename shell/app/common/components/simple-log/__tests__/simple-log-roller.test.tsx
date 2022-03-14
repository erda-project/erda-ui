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
import SimpleLogRoller from '../simple-log-roller';
import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import commonStore from 'common/stores/common';
import { flushPromises } from 'test/utils';

describe('SimpleLogRoller', () => {
  it('should work well', async () => {
    const query = { requestId: 'erda', applicationId: 1 };
    const log: COMMON.LOG = {
      emptyTimes: 1,
      fetchPeriod: 3,
      content: [
        {
          source: 'runtime log',
          id: '12',
          stream: 'string',
          timeBucket: 'erda',
          timestamp: 1647167136931,
          offset: '1',
          content: '2021-06-29T11:05:45.713Z INFO - [content]',
          level: 'INFO',
          requestId: query.requestId,
        },
      ],
    };
    const logKey = 'erda-log';
    const style = {
      width: '100%',
    };
    const originFetchLog = commonStore.effects.fetchLog;
    const originClearLog = commonStore.reducers.clearLog;
    const originUseSore = commonStore.useStore;
    const fetchLog = jest.fn().mockResolvedValue({});
    const clearLog = jest.fn();
    commonStore.effects.fetchLog = fetchLog;
    commonStore.reducers.clearLog = clearLog;
    let result: RenderResult;
    await act(async () => {
      result = render(<SimpleLogRoller query={query} logKey="erda-log" style={style} searchOnce={false} />);
      await flushPromises();
    });
    fireEvent.click(result!.getAllByText('start')[0]);
    expect(result!.container.querySelector('.log-viewer')).toHaveStyle(style);
    expect(fetchLog).toHaveBeenLastCalledWith({ ...query, logKey });
    await act(async () => {
      result = render(
        <SimpleLogRoller query={{ requestId: query.requestId }} logKey="erda-log" style={style} searchOnce={false} />,
      );
      await flushPromises();
    });
    expect(fetchLog).toHaveBeenLastCalledWith({ requestId: query.requestId, logKey });
    commonStore.useStore = (fn) =>
      fn({
        logsMap: {
          [logKey]: log,
        },
        slidePanelComps: [],
      });
    await act(async () => {
      result = render(
        <SimpleLogRoller query={{ requestId: query.requestId }} logKey="erda-log" style={style} searchOnce={false} />,
      );
      await flushPromises();
    });
    expect(result!.container).isExit('.log-insight-item', 1);
    fireEvent.click(result!.getAllByText('back to top')[0]);
    result!.unmount();
    expect(clearLog).toHaveBeenCalled();
    commonStore.effects.fetchLog = originFetchLog;
    commonStore.reducers.clearLog = originClearLog;
    commonStore.useStore = originUseSore;
  });
});

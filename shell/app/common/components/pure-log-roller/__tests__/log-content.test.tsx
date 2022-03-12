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
import { render } from '@testing-library/react';
import LogContent from '../log-content';
import moment from 'moment';

describe('LogContent', () => {
  const logs = [
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
  const formatDate = (time: number) => moment(time).format('YYYY-MM-DD HH:mm:ss');
  it('should render well', () => {
    const transformContentFn = (content: string) => {
      return {
        content,
        suffix: <div className="log-suffix">[ERDA-LOG]</div>,
      };
    };
    const result = render(<LogContent logs={logs} transformContent={transformContentFn} />);
    expect(result.container).isExit('.log-item', logs.length);
    expect(result.container).isExit('.log-suffix', logs.length);
    expect(result.container.querySelectorAll('.log-item-logtime')[0].innerHTML).toBe(
      formatDate(logs[0].timestamp * 1000),
    );
    expect(result.container.querySelectorAll('.log-item-logtime')[2].innerHTML).toBe(
      formatDate(logs[2].timestamp / 1000000),
    );
  });
});

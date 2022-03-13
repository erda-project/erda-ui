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
import SimpleLog from '../simple-log';
import { flushPromises } from 'test/utils';

jest.mock('../simple-log-roller', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  return (props) => (
    <div className="mock-simple-log-roller">
      <span className="props-logKey">{props.logKey}</span>
      <span className="props-query">{JSON.stringify(props.query)}</span>
    </div>
  );
});

describe('SimpleLog', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well', async () => {
    const query = { requestId: 'erda', applicationId: 1 };
    const result = render(<SimpleLog {...query} />);
    expect(result.container.querySelector('.props-logKey')?.innerHTML).toBe('log-insight');
    expect(result.container.querySelector('.props-query')?.innerHTML).toBe(JSON.stringify(query));
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'cloud' } });
    fireEvent.click(result.container.querySelector('.log-search-btn')!);
    await flushPromises();
    expect(result.container.querySelector('.props-query')?.innerHTML).toBe(JSON.stringify({ requestId: 'cloud' }));
  });
});

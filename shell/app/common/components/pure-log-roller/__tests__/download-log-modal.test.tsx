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
import { flushPromises, resetMockDate, setMockDate } from 'test/utils';
import { DownloadLogModal } from '../download-log-modal';

jest.mock('antd', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const moment = require('moment');
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const antd = jest.requireActual('antd');
  const DatePicker = (props) => {
    React.useEffect(() => {
      props.disabledDate(moment());
      props.disabledDate();
    }, []);
    const onOk = () => {
      props.onOk(moment());
    };
    return (
      <div className="mock-data-picker">
        <div onClick={onOk}>NOW</div>
      </div>
    );
  };
  return {
    ...antd,
    DatePicker,
  };
});

describe('DownloadLogModal', () => {
  afterAll(() => {
    setMockDate();
  });
  afterAll(() => {
    resetMockDate();
    jest.resetAllMocks();
  });
  const query = {
    taskID: 1,
    downloadAPI: '/api/log/download',
  };
  const startTimestamp = Date.now() * 1000000;
  it('should work well', async () => {
    const cancelFn = jest.fn();
    const spyOpen = jest.spyOn(window, 'open').mockImplementation();
    const result = render(<DownloadLogModal onCancel={cancelFn} visible query={query} start={startTimestamp} />);
    fireEvent.click(result.getByText('NOW'));
    fireEvent.click(result.getByText('OK'));
    await flushPromises();
    expect(spyOpen).toHaveBeenCalledTimes(1);
    expect(cancelFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.getByText('Cancel'));
    expect(cancelFn).toHaveBeenCalledTimes(2);
    spyOpen.mockRestore();
  });
  it('should work well without  downloadAPI', async () => {
    const cancelFn = jest.fn();
    const spyOpen = jest.spyOn(window, 'open').mockImplementation();
    const result = render(
      <DownloadLogModal
        onCancel={cancelFn}
        visible
        query={{ ...query, downloadAPI: undefined }}
        start={startTimestamp}
      />,
    );
    fireEvent.click(result.getByText('NOW'));
    fireEvent.change(result.getByPlaceholderText('please enter any time from 1 to 60 minutes'), {
      target: { value: 10 },
    });
    fireEvent.click(result.getByText('OK'));
    await flushPromises();
    expect(spyOpen).toHaveBeenCalledTimes(1);
    expect(cancelFn).toHaveBeenCalledTimes(1);
    spyOpen.mockRestore();
  });
});

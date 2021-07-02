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
import { DownloadLogModal } from 'common/components/log/download-log-modal';
import { shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';
import moment from 'moment';

describe('DownloadLogModal', () => {
  it('DownloadLogModal should work well', () => {
    const spyOpen = jest.spyOn(window, 'open').mockImplementation(() => {});
    const startTimestamp = 1624954155390947968;
    const defaultPickerValue = moment(startTimestamp / 1000000).subtract(1, 'hours');
    const anHourAgo = moment().subtract(1, 'hours');
    const cancelFn = jest.fn();
    const setFieldsValue = jest.fn();
    const query = {
      taskID: 1,
      downloadAPI: '/api/log/download',
    };
    const wrapper = shallow(<DownloadLogModal start={startTimestamp} visible query={query} onCancel={cancelFn} />);
    wrapper.prop('onOk')({ startTime: defaultPickerValue, endTime: 5 });
    expect(spyOpen).toHaveBeenLastCalledWith(
      '/api/erda/log/download?count=200&end=1624950855390000000&id=pipeline-task-1&source=job&start=1624950555390000000&stream=stdout',
    );
    expect(cancelFn).toHaveBeenCalledTimes(1);
    expect(wrapper.prop('fieldsList')).toHaveLength(2);
    const [start, duration] = wrapper.prop('fieldsList');
    const startWrapper = shallow(<div>{start.getComp({ form: { setFieldsValue } })}</div>);
    expect(startWrapper.find('Picker').prop('defaultPickerValue')?.isSame(defaultPickerValue, 'date')).toBeTruthy();
    expect(startWrapper.find('Picker').prop('disabledDate')()).toBeFalsy();
    expect(startWrapper.find('Picker').prop('disabledDate')(anHourAgo)).toBeFalsy();
    startWrapper.find('Picker').prop('onOk')();
    expect(setFieldsValue).toHaveBeenCalledTimes(1);
    const durationWrapper = shallow(<div>{duration.getComp({ form: { setFieldsValue } })}</div>);
    durationWrapper.find('InputNumber').prop('onChange')();
    expect(setFieldsValue).toHaveBeenCalledTimes(2);
    wrapper.prop('onCancel')();
    expect(cancelFn).toHaveBeenCalledTimes(2);
    spyOpen.mockReset();
  });
});

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
import { LoadingContent, LoadingSkeleton } from 'common';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

describe('loading-skeleton', () => {
  it('LoadingSkeleton should render well', () => {
    const wrapper = mount(<LoadingSkeleton />);
    expect(wrapper).toMatchSnapshot();
  });
  it('LoadingContent should render well', () => {
    jest.useFakeTimers();
    const wrapper = mount(<LoadingContent />);
    expect(wrapper).toBeEmptyRender();
    act(() => {
      jest.runAllTimers();
    });
    wrapper.update();
    expect(wrapper.find('.main-holder')).toExist();
    wrapper.unmount();
  });
});

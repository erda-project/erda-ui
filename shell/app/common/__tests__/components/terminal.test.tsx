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
import { Terminal } from 'common';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';
import * as xterm from 'common/utils/xterm';

describe('Terminal', () => {
  beforeAll(() => {
    jest.spyOn(xterm, 'createTerm').mockImplementation(() => ({
      fit: () => {},
    }));
    jest.spyOn(xterm, 'destroyTerm').mockImplementation(() => {});
  });
  it('should ', () => {
    jest.useFakeTimers();
    const wrapper = mount(<Terminal />);
    jest.runAllTimers();
    expect(wrapper.find('span').text()).toBe('full screen');
    wrapper.find('Button.resize-button').simulate('click');
    expect(wrapper.find('span').text()).toBe('exit full screen');
    wrapper.unmount();
  });
});

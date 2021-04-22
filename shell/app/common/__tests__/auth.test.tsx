// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { NoAuthTip } from '../components/auth';
import { shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('NoAuthTip', () => {
  it('render with no children', () => {
    const wrapper = shallow(
      <NoAuthTip />
    );
    expect(wrapper.children()).not.toExist();
  });
  it('render with children', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <NoAuthTip>
        <button onClick={onClick} className="buttons">click me</button>
      </NoAuthTip>
    );
    expect(wrapper.find('.buttons')).toHaveClassName('not-allowed');
    expect(wrapper.find('.buttons').prop('disabled')).toBe(true);
    expect(wrapper.find('.buttons').prop('onClick')).toBeFalsy();
    wrapper.find('.buttons').simulate('click');
    expect(onClick).not.toHaveBeenCalled();
  });
});

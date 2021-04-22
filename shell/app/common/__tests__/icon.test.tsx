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
import { Icon } from '../components/icon';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('icon', () => {
  const iconType = 'loading';
  it('should render base icon', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <Icon type={iconType} onClick={onClick} className="icon-class" />
    );
    wrapper.find('.iconfont').simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.find(`i.icon-${iconType}`).length).toBe(1);
    expect(wrapper.find('i')).toHaveClassName('icon-class');
  });
  it('should render colur icon', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <Icon type={iconType} color onClick={onClick} className="icon-class" />
    );
    wrapper.find('.icon').simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.find('svg.icon').length).toBe(1);
    expect(wrapper.find('use')).toHaveHTML(`<use xlink:href="#icon-${iconType}"></use>`);
    expect(wrapper.find('svg')).toHaveClassName('icon-class');
  });
});

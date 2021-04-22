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
import OperateBtn from '../components/operate-btn';
import { shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('OpreationBtn', () => {
  const getWrapper = (props = {}, onClick = () => {}) => {
    return shallow(
      <OperateBtn {...props}>
        <a className="btns btns1" href="" onClick={onClick}>btn1</a>
        <a className="btns btns2" href="">btn1</a>
        <a className="btns btns3" href="">btn1</a>
        <a className="btns btns4" href="">btn1</a>
        <a className="btns btns5" href="">btn1</a>
        <a className="btns btns6" href="">btn1</a>
      </OperateBtn>
    );
  };
  it('should render with default props', () => {
    // default Props: {limit: 3}
    const onClick = jest.fn();
    const wrapper = getWrapper({}, onClick);
    expect(wrapper.find({ type: 'more' })).toExist();
    wrapper.find('.btns1').simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.children('.btns')).toHaveLength(2);
  });
  it('should render with customize props', () => {
    const more = <span className="more-opreations">more-opreations</span>;
    const wrapper = getWrapper({ limit: 4, ellipses: more, className: 'customize-class' });
    expect(wrapper.find('.more-opreations').text()).toBe('more-opreations');
    expect(wrapper).toHaveClassName('customize-class');
    expect(wrapper.children('.btns')).toHaveLength(3);
  });
});

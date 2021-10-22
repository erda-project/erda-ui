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
import { ClassWrapper } from 'common/components/class-wrap';
import { Input } from 'antd';
import { mount } from 'enzyme';

describe('ClassWrapper', () => {
  it('should empty render', () => {
    const wrapper = mount(<ClassWrapper />);
    expect(wrapper).toBeEmptyRender();
  });
  it('should render string', () => {
    const wrapper = mount(<ClassWrapper>erda</ClassWrapper>);
    expect(wrapper.text()).toBe('erda');
  });
  it('should render with ReactNode', () => {
    const wrapperChangeFn = jest.fn();
    const childChangeFn = jest.fn();
    const wrapper = mount(
      <ClassWrapper onChange={wrapperChangeFn}>
        <Input className="children" onChange={childChangeFn} />
      </ClassWrapper>,
    );
    expect(wrapper.find('.children')).toExist();
    wrapper.find('Input').simulate('change', { target: { value: 'erda' } });
    const wrapperEvent = wrapperChangeFn.mock.calls[0][0];
    const childEvent = wrapperChangeFn.mock.calls[0][0];
    expect(wrapperChangeFn).toHaveBeenCalled();
    expect(childChangeFn).toHaveBeenCalled();
    expect(wrapperEvent.target).toStrictEqual({
      value: 'erda',
    });
    expect(childEvent.target).toStrictEqual({
      value: 'erda',
    });
  });
});

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
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

describe('ClassWrapper', () => {
  it('should empty render', () => {
    const wrapper = mount(
      <ClassWrapper />
    );
    expect(wrapper).toBeEmptyRender();
  });
  it('should render string', () => {
    const wrapper = mount(
      <ClassWrapper>
        erda
      </ClassWrapper>
    );
    expect(wrapper.text()).toBe('erda');
  });
  it('should render with ReactNode', () => {
    const wrapper = mount(
      <ClassWrapper>
        <div className="children">
          erda
        </div>
      </ClassWrapper>
    );
    expect(wrapper.find('.children')).toExist();
  });
});

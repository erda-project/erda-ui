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

import * as React from 'react';
import ColorLable from '../components/color-label';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('color-label', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  it('banse', () => {
    const wrapper = mount(
      <ColorLable
        key="labels"
        name="labels"
        className="custom-class-name"
        onClose={onClose}
        onClick={onClick}
        style={{ color: 'red' }}
      />
    );
    expect(wrapper.hasClass('custom-class-name')).toEqual(true);
    expect(wrapper.find('.pk-tag')).toHaveText('·labels');
    wrapper.find('.pk-tag').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});

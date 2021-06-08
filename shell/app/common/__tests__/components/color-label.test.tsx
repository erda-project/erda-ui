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


import * as React from 'react';
import { ColorLabel } from 'common';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('color-label', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  it('banse', () => {
    const wrapper = mount(
      <ColorLabel
        key="labels"
        name="labels"
        className="custom-class-name"
        onClose={onClose}
        onClick={onClick}
        style={{ color: 'red' }}
      />,
    );
    expect(wrapper.hasClass('custom-class-name')).toEqual(true);
    expect(wrapper.find('.pk-tag')).toHaveText('·labels');
    wrapper.find('.pk-tag').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});

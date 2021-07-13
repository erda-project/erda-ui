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

import { ImgHolder } from 'common';
import React from 'react';
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

const imgUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';

describe('ImgHolder', () => {
  it('render with src', () => {
    const wrapper = mount(<ImgHolder src={imgUrl} rect="40x40" />);
    expect(wrapper.find('img').prop('src')).toBe(imgUrl);
    expect(wrapper.find('img')).toHaveStyle({
      height: '40px',
      width: '40px',
    });
    wrapper.find('img').simulate('error');
    expect(wrapper.find('img').prop('data-img-error-src')).toBe(imgUrl);
  });
  it('render without src', () => {
    const wrapper = mount(<ImgHolder rect="40x40" type="avatar" text="D" />);
    expect(wrapper.find('img').prop('data-src')).toBe(
      `holder.js/40x40?${encodeURI('size=12&text=D&theme=avatar&font=PingFang SC&fontweight=normal')}`,
    );
  });
});

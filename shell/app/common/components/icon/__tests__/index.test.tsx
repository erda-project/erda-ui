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
import Icon from '../index';
import { fireEvent, render } from '@testing-library/react';

describe('icon', () => {
  const iconType = 'loading';
  it('should render base icon', () => {
    const onClick = jest.fn();
    const wrapper = render(<Icon type={iconType} onClick={onClick} className="icon-class" />);
    fireEvent.click(wrapper.container.querySelector('.iconfont')!);
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.container.querySelectorAll(`i.icon-${iconType}`).length).toBe(1);
    expect(wrapper.container.querySelector('i')?.classList.value.includes('icon-class')).toBeTruthy();
  });
  it('should render color icon', () => {
    const onClick = jest.fn();
    const wrapper = render(<Icon type={iconType} color onClick={onClick} className="icon-class" />);
    fireEvent.click(wrapper.container.querySelector('.icon')!);
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.container.querySelector('svg')?.innerHTML).toBe(`<use xlink:href="#icon-${iconType}"></use>`);
    expect(wrapper.container.querySelector('svg')?.classList.value.includes('icon-class')).toBeTruthy();
  });
  it('should type is ReactElement', () => {
    const type = <span className="invalid-type">erda</span>;
    // @ts-ignore
    const wrapper = render(<Icon type={type} className="icon-class" />);
    expect(wrapper.container.querySelectorAll('.invalid-type').length).toBe(1);
  });
  it('should type is preset', () => {
    const wrapper = render(<Icon type="ISSUE_ICON.issue.REQUIREMENT" />);
    expect(wrapper.container.querySelector('iconpark-icon')?.getAttribute('name')).toBe('xuqiu');
  });
});

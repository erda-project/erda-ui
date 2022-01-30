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
import EmptyHolder from '../index';
import { render } from '@testing-library/react';

describe('EmptyHolder', () => {
  it('render EmptyHolder', () => {
    const action = <div>action</div>;
    const wrapper = render(<EmptyHolder action={action} />);
    expect(wrapper.getAllByText(`action`).length).toBe(1);
    expect(wrapper.getAllByText(`no data`).length).toBe(1);
    wrapper.rerender(<EmptyHolder icon={<div className="icon-wrapper" />} />);
    expect(wrapper.container.querySelectorAll(`.icon-wrapper`).length).toBe(1);
  });
  it('should render with scene', () => {
    const scene = 'create-app';
    const wrapper = render(<EmptyHolder scene={scene} />);
    expect(wrapper.getAllByAltText(`${scene}-empty-image`).length).toBe(1);
    expect(wrapper.container.querySelector('.title')?.classList.value.includes('text-center')).toBeTruthy();
    wrapper.rerender(<EmptyHolder scene={scene} direction="row" />);
    expect(wrapper.container.querySelector('.title')?.classList.value.includes('text-center')).toBeFalsy();
  });
});

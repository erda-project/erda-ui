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
import { render } from '@testing-library/react';
import SwitchAutoScroll from '..';

describe('SwitchAutoScroll', () => {
  it('should render well with toPageTop', () => {
    const div = document.createElement('div', {});
    div.id = 'main';
    const result = render(<SwitchAutoScroll toPageTop triggerBy={{}} />, { container: document.body.appendChild(div) });
    expect(result.container.firstChild).toBeNull();
    const main = document.querySelector('#main');
    expect(main?.scrollTop).toBe(0);
  });
  it('should render well without toPageTop', () => {
    const scrollIntoViewFn = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: scrollIntoViewFn,
    });
    const result = render(<SwitchAutoScroll triggerBy={{}} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(scrollIntoViewFn).toHaveBeenCalled();
  });
});

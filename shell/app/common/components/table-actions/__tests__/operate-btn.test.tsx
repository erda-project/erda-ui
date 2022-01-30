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
import TableActions from '..';
import { fireEvent, render } from '@testing-library/react';

describe('TableActions', () => {
  const getWrapper = (props = {}, onClick = () => {}) => {
    return render(
      <TableActions {...props}>
        <a className="btns btns1" href="" onClick={onClick}>
          btn1
        </a>
        <a className="btns btns2" href="">
          btn2
        </a>
        <a className="btns btns3" href="">
          btn3
        </a>
        <a className="btns btns4" href="">
          btn4
        </a>
        <a className="btns btns5" href="">
          btn5
        </a>
        text
        <a className="btns btns6" href="">
          btn6
        </a>
      </TableActions>,
    );
  };
  it('should render with default props', () => {
    const onClick = jest.fn();
    const wrapper = getWrapper({}, onClick);
    expect(wrapper.container.querySelectorAll('.btns').length).toBe(2);
    expect(wrapper.getAllByLabelText('icon: more').length).toBe(1);
    fireEvent.click(wrapper.getByLabelText('icon: more'));
    fireEvent.click(wrapper.container.querySelector('.operator-dropdown-wrap')!);
    fireEvent.click(wrapper.getByText('btn1'));
    expect(onClick).toHaveBeenCalled();
  });
  it('should render with customize props', () => {
    const more = <span className="more-operations">more-operations</span>;
    const wrapper = getWrapper({ limit: 4, ellipses: more, className: 'customize-class' });
    expect(wrapper.container.querySelector('.more-operations')?.innerHTML).toBe('more-operations');
    expect(wrapper.container.querySelectorAll('.btns').length).toBe(3);
    expect(
      wrapper.container.querySelector('.table-operations')?.classList.value.includes('customize-class'),
    ).toBeTruthy();
  });
  it('should render with limit greater than the number of btns', () => {
    const more = <span className="more-operations">more-operations</span>;
    const wrapper = getWrapper({ limit: 8, ellipses: more, className: 'customize-class' });
    expect(wrapper.container.querySelectorAll('.btns').length).toBe(6);
  });
});

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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownSelect from '..';

interface IMenuItem {
  key: string;
  name: string;
  disabled?: boolean;
  children?: IMenuItem[];
}

describe('DropdownSelect', () => {
  const menuList: IMenuItem[] = [
    {
      key: 'menu-1',
      name: 'menu-1',
    },
    {
      key: 'menu-2',
      name: 'menu-2',
      children: [
        {
          key: 'menu-2-1',
          name: 'menu-2-1',
        },
        {
          key: 'menu-2-2',
          name: 'menu-2-2',
        },
        {
          key: 'menu-2-3',
          name: 'menu-2-3',
          disabled: true,
        },
      ],
    },
    {
      key: 'menu-3',
      name: 'menu-3',
      disabled: true,
    },
  ];
  it('should work well', async () => {
    const clickMenuFn = jest.fn();
    const result = render(<DropdownSelect menuList={menuList} onClickMenu={clickMenuFn} />);
    expect(result.container).isExist('[name="caret-down"]', 1);
    fireEvent.click(result.container.querySelector('[name="caret-down"]')!);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(screen.getByText('menu-1').closest('li')!);
    expect(clickMenuFn).toHaveBeenCalledTimes(1);
    expect(clickMenuFn.mock.calls[0][0].key).toBe(menuList[0].key);
    fireEvent.click(screen.getByText('menu-3').closest('li')!);
    expect(clickMenuFn).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('menu-2').closest('li')!);
    expect(clickMenuFn).toHaveBeenCalledTimes(1);
  });
});

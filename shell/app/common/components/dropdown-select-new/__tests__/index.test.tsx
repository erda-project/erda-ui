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

interface IOption {
  key: string;
  label: string;
  disabled?: boolean;
  children?: IOption[];
}

describe('DropdownSelect', () => {
  const options: IOption[] = [
    {
      key: 'menu-1',
      label: 'menu-1',
    },
    {
      key: 'menu-2',
      label: 'menu-2',
      children: [
        {
          key: 'menu-2-1',
          label: 'menu-2-1',
        },
        {
          key: 'menu-2-2',
          label: 'menu-2-2',
        },
        {
          key: 'menu-2-3',
          label: 'menu-2-3',
          disabled: true,
        },
      ],
    },
    {
      key: 'menu-3',
      label: 'menu-3',
      disabled: true,
    },
  ];
  const itemSelector = '.erda-dropdown-select-option-item';

  it('should work well in basic usage', async () => {
    const clickMenuFn = jest.fn();
    const result = render(<DropdownSelect options={options} onClickItem={clickMenuFn} />);
    expect(result.container).isExist('.erda-dropdown-select', 1);
    fireEvent.click(result.getByText('please select'));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    expect(result.baseElement).isExist('.erda-dropdown-select-option-group', 1);

    expect(result.baseElement).isExist(itemSelector, 5);
    fireEvent.click(screen.getByText(options[0].label).closest(itemSelector)!);
    expect(clickMenuFn).toHaveBeenCalledTimes(1);
    expect(clickMenuFn.mock.calls[0]).toEqual([options[0].key, options[0]]);
    // click disabled
    fireEvent.click(screen.getByText('menu-3').closest(itemSelector)!);
    expect(clickMenuFn).toHaveBeenCalledTimes(1);
    // click nest
    fireEvent.click(screen.getByText('menu-2-1').closest(itemSelector)!);
    expect(clickMenuFn).toHaveBeenCalledTimes(2);
    // click nest disabled
    fireEvent.click(screen.getByText('menu-2-3').closest(itemSelector)!);
    expect(clickMenuFn).toHaveBeenCalledTimes(2);
  });

  it('support title, simple mode, size, showFilter, customTrigger', async () => {
    const result = render(
      <DropdownSelect
        options={options}
        // value={options[0].key}
        title="list title"
        mode="simple"
        optionSize="small"
        showFilter
      >
        <div id="trigger">please select</div>
      </DropdownSelect>,
    );
    expect(result.container).isExist('#trigger', 1);
    fireEvent.click(result.container.querySelector('#trigger')!);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    expect(screen.getByText('list title')).toBeTruthy();

    // FIXME: chosen item not exist when pass custom children
    // expect(result.baseElement).isExist('.selected-item', 1);

    // TODO: add simple mode test

    expect(result.baseElement).isExist('.small', 5);

    const filterInput = result.baseElement.querySelector('input');
    expect(filterInput).toBeTruthy();

    fireEvent.change(filterInput!, { target: { value: 'menu-2' } });
    expect(result.baseElement).isExist('.erda-dropdown-select-menu input', 1);
    // TODO: how to trigger render?
    // expect(result.baseElement).isExist(itemSelector, 3);
  });
});

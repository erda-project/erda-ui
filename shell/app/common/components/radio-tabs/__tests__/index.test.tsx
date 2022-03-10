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
import userEvent from '@testing-library/user-event';
import RadioTabs, { RadioTabsProps } from '..';

describe('RadioTabs', () => {
  const options: RadioTabsProps<string>['options'] = [
    {
      label: 'tab1',
      value: 'tab1',
    },
    {
      label: 'tab2',
      value: 'tab2',
      icon: 'help',
      tip: 'this is a tip of tab2',
    },
    {
      label: 'tab3',
      value: 'tab3',
      children: [
        {
          label: 'tab3-1',
          value: 'tab3-1',
        },
        {
          label: 'tab3-2',
          value: 'tab3-2',
          icon: 'close',
          tip: 'this is a tip of tab3-2',
        },
      ],
    },
    {
      label: 'tab4',
      value: 'tab4',
      icon: 'branch',
      disabled: true,
      tip: 'this is a tip of tab2',
    },
    {
      label: 'tab5',
      value: 'tab5',
      icon: 'mr',
      children: [
        {
          label: 'tab5-1',
          value: 'tab5-1',
        },
        {
          label: 'tab5-2',
          value: 'tab5-2',
          icon: 'close',
          tip: 'this is a tip of tab5-2',
        },
      ],
    },
  ];
  it('should work well', async () => {
    const changeFn = jest.fn();
    const result = render(<RadioTabs options={options} defaultValue={options[1].value} onChange={changeFn} />);
    expect(result.getAllByText(/tab\d/)).toHaveLength(options.length);
    fireEvent.click(result.getByText(options[0].value));
    expect(changeFn).toHaveBeenLastCalledWith(options[0].value, options[0]);
    result.rerender(
      <RadioTabs options={options} defaultValue={options[1].value} value={options[0].value} onChange={changeFn} />,
    );
    const child: RadioTabsProps<string>['options'] = options[2].children!;
    fireEvent.click(result.getByText(child[0].value));
    expect(changeFn).toHaveBeenCalledTimes(2);
    result.rerender(
      <RadioTabs options={options} defaultValue={options[1].value} value={child[0].value} onChange={changeFn} />,
    );
    userEvent.hover(result.getByText(child[0].value));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText(child[1].value));
    expect(changeFn).toHaveBeenCalledTimes(3);
  });
});

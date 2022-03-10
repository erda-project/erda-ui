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
import userEvent from '@testing-library/user-event';
import SimpleTabs from '..';

describe('SimpleTabs', () => {
  const tabs = [
    {
      key: 'tab1',
      text: 'TAB1',
    },
    {
      key: 'tab2',
      text: 'TAB2',
      tip: 'this is tab2',
    },
    {
      key: 'tab3',
      text: 'TAB3',
      disabled: true,
    },
    {
      key: 'tab4',
      text: 'TAB4',
      tip: 'this is tab4',
      disabled: true,
    },
  ];
  it('should render well', async () => {
    const selectFn = jest.fn();
    const result = render(<SimpleTabs tabs={tabs} value={tabs[0].key} onSelect={selectFn} />);
    expect(screen.getByText(tabs[0].text).closest('div')).toHaveClass('selected');
    expect(screen.getByText(tabs[2].text).closest('div')).toHaveClass('not-allowed');
    expect(result.container.querySelector('.common-simple-tabs')).toHaveClass('tabs-button');
    expect(result.container.querySelector('.common-simple-tabs')).toHaveClass('theme-light');
    userEvent.hover(result.getByText(tabs[1].text));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    expect(result.getByText(tabs[1].tip!)).toBeTruthy();
    fireEvent.click(result.getByText(tabs[1].text));
    expect(selectFn).toHaveBeenCalledWith(tabs[1].key);
    expect(selectFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.getByText(tabs[2].text));
    expect(selectFn).toHaveBeenCalledTimes(1);
  });
});

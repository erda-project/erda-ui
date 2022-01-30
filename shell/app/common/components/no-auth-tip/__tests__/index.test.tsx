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
import NoAuthTip from '../index';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('NoAuthTip', () => {
  it('render with no children', () => {
    const wrapper = render(<NoAuthTip />);
    expect(wrapper.container.firstChild).toBeNull();
  });
  it('render with children', () => {
    const onClick = jest.fn();
    const wrapper = render(
      <NoAuthTip>
        <div onClick={onClick} className="buttons">
          click me
        </div>
      </NoAuthTip>,
    );
    expect(wrapper.container.querySelector('.buttons')?.classList.value.includes('not-allowed')).toBeTruthy();
    userEvent.hover(screen.getByText('click me'));
    waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe('no permission');
    });
    fireEvent.click(screen.getByText('click me'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

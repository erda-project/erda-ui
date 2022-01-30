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
import Badge from '../index';

describe('Badge', () => {
  const badgeText = 'badge text';
  const tipText = 'tip text';
  it('should render with text', () => {
    const fn = jest.fn();
    const result = render(
      <Badge tip={tipText} text={badgeText} showDot={false} status={Badge.BadgeStatus.success} onClick={fn} />,
    );
    expect(result.container.querySelector('.erda-badge-status-text')?.innerHTML).toContain(badgeText);
    userEvent.hover(screen.getByText(badgeText));
    waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(tipText);
    });
    fireEvent.click(screen.getByText(badgeText));
    expect(fn).toHaveBeenCalled();
  });
  it('should render with onlyDot', () => {
    const result = render(
      <Badge tip={tipText} text={badgeText} status={Badge.BadgeStatus.success} onlyDot breathing />,
    );
    expect(result.container.querySelectorAll('.erda-badge-status-text').length).toBe(0);
  });
});

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
import { render, screen, waitFor } from '@testing-library/react';
import { getLabel } from 'common/utils/component-utils';
import userEvent from '@testing-library/user-event';

describe('getLabel', () => {
  const label = 'i am a label';
  const tips = 'i an a tips';
  beforeEach(() => {});
  it('should only label', () => {
    expect(getLabel(label)).toBe(label);
  });
  it('should not show tips', async () => {
    const Comp = getLabel(label, tips, false);
    const result = render(<div>{Comp}</div>);
    userEvent.hover(result.container.querySelector('iconpark-icon')!);
    await waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(tips);
    });
  });
  it('should not show tips', async () => {
    const Comp = getLabel(label, tips, true);
    const result = render(<div>{Comp}</div>);
    expect(result.getByText('*').textContent).toEqual('*');
    userEvent.hover(result.container.querySelector('iconpark-icon')!);
    await waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(tips);
    });
  });
});

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
import ErdaAlert from '../index';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ErdaAlert', () => {
  it('should work well', () => {
    const message = 'erda alert message';
    const result = render(<ErdaAlert message={message} closeable={false} />);
    expect(result.container.querySelectorAll('.ant-alert-close-icon').length).toBe(0);
    expect(screen.getAllByText(message).length).toBe(1);
  });
  it('should allow close', async () => {
    const message = 'erda alert message';
    const result = render(<ErdaAlert message={message} closeable showOnceKey="erda-alert" />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.container.querySelectorAll('.ant-alert-close-icon').length).toBe(1);
    userEvent.click(result.container.querySelector('.hover-active')!);
    await waitFor(() => {
      expect(result.container.firstChild).toBeNull();
    });
  });
});

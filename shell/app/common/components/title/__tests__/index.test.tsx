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
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Title from '..';

describe('Title', () => {
  const title = 'erda title';
  const tips = 'erda title';
  it('should render well', async () => {
    const result = render(<Title title={title} />);
    expect(result.container).isExit('.h-12', 1);
    expect(result.getByText(title)).toBeTruthy();
    expect(result.container).isExit('[name="help"]', 0);
    expect(result.container).isExit('.border-bottom', 1);
    result.rerender(<Title title={title} tip={tips} />);
    expect(result.container).isExit('[name="help"]', 1);
    userEvent.hover(result.container.querySelector('[name="help"]')!);
    await waitFor(() => expect(screen.queryByText(tips)).toBeInTheDocument());
    result.rerender(<Title title={title} showDivider={false} />);
    expect(result.container).isExit('.border-bottom', 0);
  });
  it('should render with operations', () => {
    const result = render(
      <Title title={title} mb={16} mt={8} operations={['title1', { title: 'title2' }, <div>title3</div>]} />,
    );
    expect(result.getByText('title2')).toBeTruthy();
    expect(result.getByText('title3')).toBeTruthy();
  });
});

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
import Tags, { TagItem } from '..';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const labels = [
  {
    label: 'tag1',
  },
  {
    label: 'tag2',
    color: 'red',
  },
  {
    label: 'tag3',
    color: 'gray',
    checked: true,
  },
  {
    label: 'tag4',
    group: 'tagGroup',
  },
  {
    label: 'tag5',
    group: 'tagGroup',
  },
];

describe('Tags', () => {
  it('should render well', async () => {
    const result = render(<Tags labels={labels} maxShowCount={10} />);
    expect(result.getAllByText(/tag\d/)).toHaveLength(labels.length);
    result.rerender(<Tags labels={labels} />);
    expect(result.getAllByText(/tag\d/)).toHaveLength(2);
    userEvent.hover(result.container.querySelector('[name="more"]')!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    fireEvent.click(screen.queryByText('tag3')!);
    expect(screen.getAllByText(/tag[345]/)).toHaveLength(3);
  });
  it('should toggle check', () => {
    const result = render(<TagItem label={{ label: 'checked' }} checked={false} />);
    expect(result.container).isExit('[name="check"]', 0);
    result.rerender(<TagItem label={{ label: 'checked' }} readOnly checked />);
    expect(result.container).isExit('.icon-tg', 1);
    result.rerender(<TagItem label={{ label: 'checked' }} checked />);
    expect(result.container).isExit('[name="check"]', 1);
    fireEvent.click(result.container.querySelector('[name="check"]')!);
    expect(result.container).isExit('[name="check"]', 0);
  });

  it('should delete well', async () => {
    const deleteFn = jest.fn();
    const result = render(<Tags labels={labels} maxShowCount={5} onDelete={deleteFn} />);
    fireEvent.click(result.container.querySelector('[name="close"]')!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    fireEvent.click(screen.getByText('Cancel'));
    expect(result.baseElement.querySelector('.ant-popover')).toHaveClass('ant-popover-hidden');
    fireEvent.click(result.container.querySelector('[name="close"]')!);
    fireEvent.click(screen.getByText('OK'));
    expect(deleteFn).toHaveBeenCalledTimes(1);
    result.rerender(<TagItem label={{ label: 'checked' }} onDelete={deleteFn} deleteConfirm={false} />);
    fireEvent.click(result.container.querySelector('[name="close"]')!);
    expect(deleteFn).toHaveBeenCalledTimes(2);
  });
});

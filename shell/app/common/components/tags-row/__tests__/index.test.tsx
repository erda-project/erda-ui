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
import '@testing-library/jest-dom';
import TagsRow, { IProps, TagItem } from '..';

describe('TagsRow', () => {
  const labels: IProps['labels'] = [
    { label: 'green label;green label' },
    { label: 'red label;red label', color: 'red' },
    { label: 'orange label;orange label', color: 'orange' },
    { label: 'purple label;purple label', color: 'purple' },
    { label: 'blue label;blue label', color: 'blue' },
    { label: 'cyan label;cyan label', color: 'cyan' },
    { label: 'gray label;gray label', color: 'gray' },
  ];
  it('should render with default props', async () => {
    const result = render(<TagsRow labels={labels} />);
    expect(result.container).isExit('.tag-default', 2);
    expect(result.container).isExit('[name="more"]', 1);
    userEvent.hover(result.container.querySelector('[name="more"]')!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    fireEvent.click(screen.queryByText(labels[labels.length - 1].label)!);
    expect(result.baseElement.querySelector('.tags-row-tooltip')).isExit('.tag-default', labels.length);
  });
  it('should render with showGroup', async () => {
    const groupLabel = labels.map((item, index) => {
      return {
        ...item,
        group: index % 2 === 0 ? 'groupA' : 'groupB',
      };
    });
    const result = render(<TagsRow labels={groupLabel} />);
    userEvent.hover(result.container.querySelector('[name="more"]')!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    expect(result.baseElement).isExit('.tag-group-name', 2);
  });
  it('should delete well', async () => {
    const deleteFn = jest.fn();
    const label = { label: 'tagITem' };
    const result = render(<TagItem label={label} onDelete={deleteFn} />);
    fireEvent.click(result.container.querySelector('[name="qingchu"]')!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
    fireEvent.click(screen.getByText('Cancel'));
    expect(result.baseElement.querySelector('.ant-popover')).toHaveClass('ant-popover-hidden');
    fireEvent.click(result.container.querySelector('[name="qingchu"]')!);
    fireEvent.click(screen.getByText('OK'));
    expect(deleteFn).toHaveBeenLastCalledWith(label);
    result.rerender(<TagItem label={label} onDelete={deleteFn} deleteConfirm={false} />);
    fireEvent.click(result.container.querySelector('[name="qingchu"]')!);
    expect(deleteFn).toHaveBeenCalledTimes(2);
    expect(deleteFn).toHaveBeenCalledWith(label);
  });
  it('should add well', () => {
    const addFn = jest.fn();
    const result = render(<TagsRow labels={[{ label: 'tagITem' }]} onAdd={addFn} />);
    fireEvent.click(result.container.querySelector('[name="tj1"]')!);
    expect(addFn).toHaveBeenCalledTimes(1);
  });
});

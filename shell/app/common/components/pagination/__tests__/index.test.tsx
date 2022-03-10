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
import Pagination from '..';

describe('Pagination', () => {
  it('should render well', () => {
    const changeFn = jest.fn();
    const result = render(<Pagination onChange={changeFn} />);
    expect(result.getByText('total 0 items')).toBeTruthy();
    expect(result.getByText('10 items / page')).toBeTruthy();
    result.rerender(<Pagination onChange={changeFn} total={99} current={2} pageSize={20} />);
    expect(result.getByText('20 items / page')).toBeTruthy();
    expect(result.getByText('total 99 items')).toBeTruthy();
    expect(result.container).isExit('[name="right"]', 1);
    expect(result.container).isExit('[name="left"]', 1);
    expect(result.getByText('2 / 5')).toBeTruthy();
    result.rerender(
      <Pagination onChange={changeFn} total={99} current={2} pageSize={20} hideTotal hidePageSizeChange />,
    );
    expect(result.queryByText('20 items / page')).toBeNull();
    expect(result.queryByText('total 99 items')).toBeNull();
  });
  it('should work well', async () => {
    const changeFn = jest.fn();
    const result = render(<Pagination onChange={changeFn} total={99} current={2} pageSize={10} />);
    const left = result.container.querySelector('[name="left"]');
    const right = result.container.querySelector('[name="right"]');
    fireEvent.click(right!);
    expect(changeFn).toHaveBeenLastCalledWith(3, 10);
    result.rerender(<Pagination onChange={changeFn} total={99} current={3} pageSize={10} />);
    fireEvent.click(left!);
    expect(changeFn).toHaveBeenLastCalledWith(2, 10);
    fireEvent.click(result.getByText('10 items / page'));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(screen.getByText('20 items / page'));
    expect(changeFn).toHaveBeenLastCalledWith(1, 20);
    result.rerender(<Pagination onChange={changeFn} total={99} current={1} pageSize={20} />);
    fireEvent.click(result.getByText('1 / 5'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 2 } });
    fireEvent.click(result.container.querySelector('[name="enter"]')!);
    expect(changeFn).toHaveBeenLastCalledWith(2, 20);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 10 } });
    fireEvent.click(result.container.querySelector('[name="enter"]')!);
    expect(changeFn).toHaveBeenLastCalledWith(5, 20);
    expect(changeFn).toHaveBeenCalledTimes(5);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 3 } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    fireEvent.click(result.container.querySelector('[name="enter"]')!);
    expect(changeFn).toHaveBeenCalledTimes(5);
  });
});

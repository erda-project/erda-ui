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
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeadOperationBar from '..';

describe('HeadOperationBar', () => {
  it('should render with extraOperation', () => {
    const extraOperation = <button>btn</button>;
    const result = render(<HeadOperationBar extraOperation={extraOperation} />);
    expect(result.getByText('btn')).toBeTruthy();
  });
  it('should render search', () => {
    const searchFn = jest.fn();
    const result = render(<HeadOperationBar onSearch={searchFn} />);
    expect(result.container).isExit('[name="search"]', 1);
    const input = result.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('search by keyword');
    fireEvent.change(input, { target: { value: 'erda' } });
    expect(searchFn).toHaveBeenCalledWith('erda');
  });
  it('should render leftSlot', () => {
    const leftSlot = <div>leftSlot</div>;
    const result = render(<HeadOperationBar leftSolt={leftSlot} />);
    expect(result.getByText('leftSlot')).toBeTruthy();
  });
  it('should render reload', () => {
    const reloadFn = jest.fn();
    const result = render(<HeadOperationBar onReload={reloadFn} />);
    expect(result.container).isExit('[name="refresh"]', 1);
    fireEvent.click(result.container.querySelector('[name="refresh"]')!);
    expect(reloadFn).toHaveBeenCalled();
  });
  it('should render with className', () => {
    const result = render(<HeadOperationBar className="search-bar" />);
    const ele = result.container.querySelector('.head-operation-bar');
    expect(ele).toHaveClass('bg-default-02');
    result.rerender(<HeadOperationBar className="bg-red" />);
    expect(ele).not.toHaveClass('bg-default-02');
  });
});

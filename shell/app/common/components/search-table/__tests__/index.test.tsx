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
import SearchTable from '..';

describe('SearchTable', () => {
  it('should render well', () => {
    const result = render(
      <SearchTable
        searchListOps={{
          list: [],
          onUpdateOps: () => {},
        }}
        extraItems={<div>SearchTable extraItems</div>}
      >
        <div>SearchTable children</div>
      </SearchTable>,
    );
    expect(result.getByText('SearchTable children')).toBeTruthy();
    expect(result.getByText('SearchTable extraItems')).toBeTruthy();
    expect(result.container).isExist('.extra-items-left', 1);
    result.rerender(<SearchTable />);
    expect(result.container).isExist('.search-input', 1);
    expect(result.container).not.isExistClass('.search-input', 'w-full');
    result.rerender(<SearchTable searchFullWidth />);
    expect(result.container).isExistClass('.search-input', 'w-full');
  });
  it('should work well', () => {
    jest.useFakeTimers();
    const searchFn = jest.fn();
    const result = render(<SearchTable onSearch={searchFn} />);
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(searchFn).toHaveBeenLastCalledWith('erda');
    fireEvent.click(result.getByLabelText('search'));
    expect(searchFn).toHaveBeenCalledTimes(2);
    result.rerender(<SearchTable onSearch={searchFn} needDebounce />);
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'cloud' } });
    jest.runAllTimers();
    expect(searchFn).toHaveBeenLastCalledWith('cloud');
    expect(searchFn).toHaveBeenCalledTimes(3);
    result.rerender(<SearchTable onSearch={searchFn} triggerByEnter />);
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    expect(searchFn).toHaveBeenCalledTimes(3);
    fireEvent.keyDown(result.getByRole('textbox'), {
      key: 'Enter',
      keyCode: 13,
    });
    expect(searchFn).toHaveBeenCalledTimes(4);
    expect(searchFn).toHaveBeenLastCalledWith('erda');
  });
});

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
import OperationBar from '..';
import { fireEvent, render, screen } from '@testing-library/react';

const searchList = [
  {
    key: 'title',
    label: '标题',
    placeholder: '搜索项目',
    type: 'input',
    name: 'title',
  },
];

describe('OperationBar', () => {
  it('should render empty', () => {
    const wrapper = render(<OperationBar searchList={[]} />);
    expect(wrapper.container.firstChild).toBeNull();
  });
  it('should render well', () => {
    const fn = jest.fn();
    const wrapper = render(<OperationBar searchList={searchList} onUpdateOps={fn} />);
    fireEvent.click(screen.getByText('reset'));
    expect(fn).toHaveBeenLastCalledWith({});
    fireEvent.change(wrapper.container.querySelector('input')!, {target: {value: 'erda'}})
    fireEvent.click(screen.getByText('search'));
    expect(fn).toHaveBeenLastCalledWith({ title: 'erda' });
  });
});

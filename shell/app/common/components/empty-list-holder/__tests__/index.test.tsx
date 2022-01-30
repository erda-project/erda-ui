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
import EmptyListHolder from '../index';
import { render } from '@testing-library/react';

describe('EmptyListHolder', () => {
  it('render EmptyListHolder', () => {
    const action = <div>action</div>;
    const wrapper = render(<EmptyListHolder action={action} />);
    expect(wrapper.getAllByText(`action`).length).toBe(1);
    expect(wrapper.getAllByText(`no data`).length).toBe(1);
    wrapper.rerender(<EmptyListHolder tip="this is a tip" />);
    expect(wrapper.getAllByText(`this is a tip`).length).toBe(1);
  });
});

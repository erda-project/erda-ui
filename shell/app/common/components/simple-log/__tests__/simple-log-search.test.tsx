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
import { flushPromises } from 'test/utils';
import SimpleLogSearch from '../simple-log-search';

describe('SimpleLogSearch', () => {
  it('should work well', async () => {
    const setSearchFn = jest.fn();
    const formData = { requestId: 'erda', applicationId: 123 };
    const result = render(<SimpleLogSearch setSearch={setSearchFn} />);
    fireEvent.change(result.getByRole('textbox'), { target: { value: formData.requestId } });
    fireEvent.click(result.container.querySelector('.log-search-btn')!);
    await flushPromises();
    expect(setSearchFn).toHaveBeenLastCalledWith({ requestId: formData.requestId });
    result.rerender(<SimpleLogSearch setSearch={setSearchFn} formData={formData} />);
    expect(result.getByRole('textbox').value).toBe(formData.requestId);
    fireEvent.click(result.container.querySelector('.log-search-btn')!);
    await flushPromises();
    expect(setSearchFn).toHaveBeenLastCalledWith(formData);
  });
});

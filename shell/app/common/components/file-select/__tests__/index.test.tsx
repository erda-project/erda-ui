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
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileSelect from '..';

describe('FileSelect', () => {
  it('should work well with beforeUpload', async () => {
    const file = new File(['logo file'], 'logo.png', {
      type: 'image/png',
    });
    const changeFn = jest.fn();
    const beforeUploadFn = jest.fn().mockReturnValue(true);
    const result = render(<FileSelect accept=".png" visible onChange={changeFn} beforeUpload={beforeUploadFn} />);
    expect(result.getByText('Please select the file to be uploaded')).toBeTruthy();
    const inp = result.container.querySelector('[type="file"]')!;
    userEvent.upload(inp, file);
    await waitFor(() => expect(result.getByText('logo.png')).toBeTruthy());
    expect(beforeUploadFn).toHaveBeenLastCalledWith(file);
    expect(changeFn).toHaveBeenLastCalledWith(file);
    result.rerender(<FileSelect accept=".png" visible={false} onChange={changeFn} beforeUpload={beforeUploadFn} />);
    expect(result.getByText('Please select the file to be uploaded')).toBeTruthy();
  });
  it('should work well without beforeUpload', async () => {
    const file = new File(['logo file'], 'logo.png', {
      type: 'image/png',
    });
    const changeFn = jest.fn();
    const result = render(<FileSelect accept=".png" visible onChange={changeFn} />);
    expect(result.getByText('Please select the file to be uploaded')).toBeTruthy();
    const inp = result.container.querySelector('[type="file"]')!;
    userEvent.upload(inp, file);
    await waitFor(() => expect(result.getByText('logo.png')).toBeTruthy());
    expect(changeFn).toHaveBeenLastCalledWith(file);
  });
});

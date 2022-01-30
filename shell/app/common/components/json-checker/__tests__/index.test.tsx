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
import JsonChecker from '../index';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('JsonChecker', () => {
  it('should work well', async () => {
    const jsonString = JSON.stringify(
      {
        data: {
          name: 'erda',
        },
      },
      null,
      2,
    );
    const onToggleFn = jest.fn();
    const wrapper = render(
      <JsonChecker jsonString={jsonString} onToggle={onToggleFn} modalConfigs={{ title: 'view Json' }} />,
    );
    fireEvent.click(wrapper.container.querySelector('button')!);
    expect(onToggleFn).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(wrapper.queryByText('view Json')).toBeInTheDocument());
    fireEvent.click(wrapper.baseElement.querySelector('.json-checker-copy')!);
    fireEvent.click(wrapper.baseElement.querySelector('.ant-modal-close')!);
    expect(onToggleFn).toHaveBeenLastCalledWith(false);
  });
});

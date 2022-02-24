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
import { Copy } from 'common';
import { render } from '@testing-library/react';
import { message } from 'antd';

const copyText = 'hello world';
describe('Copy', () => {
  let instance: Copy | null;
  it('render copy with string children', () => {
    const spySuccess = jest.spyOn(message, 'success');
    const spyError = jest.spyOn(message, 'error');
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const getAttribute = jest.fn().mockReturnValue(copyText);
    const clearSelection = jest.fn();
    const trigger = {
      getAttribute,
    };
    const wrapper = render(
      <Copy
        ref={(node) => {
          instance = node;
        }}
        selector="for_copy-select"
        className="cursor-copy"
        copyText={copyText}
        onError={onError}
        onSuccess={onSuccess}
      >
        copy
      </Copy>,
    );
    expect(wrapper.container.querySelectorAll('span.cursor-copy').length).toEqual(1);
    expect(wrapper.container.querySelector('span.cursor-copy')?.getAttribute('data-clipboard-text')).toBe(copyText);
    instance?.clipboard.emit('error', { trigger });
    expect(onError).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();
    instance?.clipboard.emit('success', { trigger, clearSelection });
    expect(onSuccess).toHaveBeenCalled();
    expect(clearSelection).toHaveBeenCalled();
    expect(spySuccess).toHaveBeenCalled();
    wrapper.rerender(
      <Copy
        ref={(node) => {
          instance = node;
        }}
        selector="for_copy-select"
        className="cursor-copy"
        copyText={copyText}
        onError={onError}
        onSuccess={onSuccess}
      >
        <div className="copy-child">copy</div>
      </Copy>,
    );
    expect(wrapper.container.querySelectorAll('.copy-child').length).toEqual(1);
    spySuccess.mockReset();
    spyError.mockReset();
    wrapper.unmount();
  });
});

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

import * as React from 'react';
import { Copy } from 'common';
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

const copytext = 'hello world';
describe('Copy', () => {
  it('render copy with string children', () => {
    // const onSuccess = jest.fn();
    const wrapper = mount(
      <div>
        <div
          className="for-copy"
          data-clipboard-tip="Email"
          data-clipboard-text={copytext}
        >
          {copytext}
        </div>
        <Copy selector="for_copy-select" className="for-copy" copyText="Copy">copy</Copy>
      </div>
    );
    wrapper.mount();
    expect(wrapper.find('span.for-copy').length).toEqual(1);
    wrapper.unmount();
  });
});

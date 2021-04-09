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

/* eslint-disable no-undef */
import * as React from 'react';
import { Copy } from 'common';


const innerSelector = '._for-copy';
describe('Copy', () => {
  it('render copy with string children', () => {
    const wrapper = mount(<Copy>copy this!</Copy>);
    expect(wrapper.find(innerSelector)).toExist();
    expect(wrapper.find(innerSelector)).toHaveHTML('<span class="_for-copy " data-clipboard-text="copy this!">copy this!</span>');

    // wrapper.find(innerSelector).first().simulate('click');

    // const testInput = mount(<div><input id="testInput" /></div>);
    // testInput.find('#testInput').simulate('focus').simulate('paste');
    // expect(testInput.find('#testInput')).toHaveValue('copy this!');

    // navigator.clipboard.readText()
    //   .then((text) => {
    //   })
    //   .catch((err) => {
    //     console.error('Failed to read clipboard contents: ', err);
    //   });
  });
});

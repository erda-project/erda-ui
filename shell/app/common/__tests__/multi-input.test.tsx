// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import MultiInput from '../components/multi-input';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';


describe('MultiInput', () => {
  it('render default', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MultiInput onChange={onChange} />
    );
    expect(wrapper.find('.multi-input-item')).toHaveLength(1);
    expect(wrapper.find({ type: 'minus-circle-o' })).not.toExist();
    wrapper.find('input').simulate('change', { target: { value: 'erda.cloud' } });
    expect(onChange).toHaveBeenLastCalledWith(['erda.cloud']);
    wrapper.find('.multi-input-item Icon').simulate('click');
    expect(wrapper.find('.multi-input-item')).toHaveLength(2);
    expect(wrapper.find({ type: 'minus-circle-o' })).toHaveLength(2);
    wrapper.find('.multi-input-item').at(1).find('input').simulate('change', { target: { value: 'doc.erda.cloud' } });
    expect(onChange).toHaveBeenLastCalledWith(['erda.cloud', 'doc.erda.cloud']);
    wrapper.find({ type: 'minus-circle-o' }).at(0).simulate('click');
    expect(wrapper.find('.multi-input-item')).toHaveLength(1);
    expect(onChange).toHaveBeenLastCalledWith(['erda.cloud']);
    expect(wrapper.find({ type: 'minus-circle-o' })).not.toExist();
  });
  it('render with init data', () => {
    let value = ['erda.cloud', 'doc.erda.cloud'];
    const wrapper = mount(
      <MultiInput value={value} onChange={(v:string[]) => { value = v; }} />
    );
    expect(wrapper.find('.multi-input-item')).toHaveLength(value.length);
    wrapper.find({ type: 'minus-circle-o' }).at(0).simulate('click');
    expect(wrapper.find('.multi-input-item')).toHaveLength(value.length);
  });
});

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

import React from 'react';
import { ProtocolInput } from '../components/protocol-selector';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('ProtocolInput', () => {
  it('should ', () => {
    const onChange = jest.fn();
    const wrapper = mount(<ProtocolInput onChange={onChange} />);
    wrapper.setProps({
      value: 'http://www.erda.cloud',
    });
    expect(wrapper.find('Select').at(0).props().value).toBe('http://');
    expect(wrapper.find('input').props().value).toBe('www.erda.cloud');
    wrapper.setProps({
      value: 'https://www.erda.cloud',
    });
    expect(wrapper.find('Select').at(0).props().value).toBe('https://');
    wrapper.find('Select').at(0).props().onChange('http://');
    expect(onChange).toHaveBeenLastCalledWith('http://www.erda.cloud');
    wrapper.find('input').simulate('change', { target: { value: 'erda.cloud' } });
    expect(onChange).toHaveBeenLastCalledWith('https://erda.cloud');
  });
});

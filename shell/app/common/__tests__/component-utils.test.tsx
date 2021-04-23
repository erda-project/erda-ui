import React from 'react';
import { shallow } from 'enzyme';
import { getLabel } from '../utils/component-utils';
import { describe, it } from '@jest/globals';

describe('getLabel', () => {
  const label = 'i am a label';
  const tips = 'i an a tips';
  it('should only label', () => {
    expect(getLabel(label)).toBe(label);
  });
  it('should not show tips', () => {
    const Comp = getLabel(label, tips, false);
    const wrapper = shallow(<div>{Comp}</div>);
    expect(wrapper.find('span').text()).toContain(label);
    expect(wrapper).not.toContain(label);
  });
  it('should not show tips', () => {
    const Comp = getLabel(label, tips, true);
    const wrapper = shallow(<div>{Comp}</div>);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('span').at(0).text()).toContain(label);
    expect(wrapper.find('span').at(1).text()).toContain('*');
    expect(wrapper.find('Tooltip').prop('title')).toBe(tips);
  });
});

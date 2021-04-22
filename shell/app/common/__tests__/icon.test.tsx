import React from 'react';
import { Icon } from '../components/icon';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('icon', () => {
  const iconType = 'loading';
  it('should render base icon', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <Icon type={iconType} onClick={onClick} className="icon-class" />
    );
    wrapper.find('.iconfont').simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.find(`i.icon-${iconType}`).length).toBe(1);
    expect(wrapper.find('i')).toHaveClassName('icon-class');
  });
  it('should render colur icon', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <Icon type={iconType} color onClick={onClick} className="icon-class" />
    );
    wrapper.find('.icon').simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(wrapper.find('svg.icon').length).toBe(1);
    expect(wrapper.find('use')).toHaveHTML(`<use xlink:href="#icon-${iconType}"></use>`);
    expect(wrapper.find('svg')).toHaveClassName('icon-class');
  });
});

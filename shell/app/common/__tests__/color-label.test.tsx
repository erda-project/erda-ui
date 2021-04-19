import * as React from 'react';
import ColorLable from '../components/color-label';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('color-label', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  it('banse', () => {
    const wrapper = mount(
      <ColorLable
        key="labels"
        name="labels"
        className="custom-class-name"
        onClose={onClose}
        onClick={onClick}
        style={{ color: 'red' }}
      />
    );
    expect(wrapper.hasClass('custom-class-name')).toEqual(true);
    expect(wrapper.find('.pk-tag')).toHaveText('·labels');
    wrapper.find('.pk-tag').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});

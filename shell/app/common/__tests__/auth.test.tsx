import React from 'react';
import { NoAuthTip } from '../components/auth';
import { shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('NoAuthTip', () => {
  it('render with no children', () => {
    const wrapper = shallow(
      <NoAuthTip />
    );
    expect(wrapper.children()).not.toExist();
  });
  it('render with children', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <NoAuthTip>
        <button onClick={onClick} className="buttons">click me</button>
      </NoAuthTip>
    );
    expect(wrapper.find('.buttons')).toHaveClassName('not-allowed');
    expect(wrapper.find('.buttons').prop('disabled')).toBe(true);
    expect(wrapper.find('.buttons').prop('onClick')).toBeFalsy();
    wrapper.find('.buttons').simulate('click');
    expect(onClick).not.toHaveBeenCalled();
  });
});

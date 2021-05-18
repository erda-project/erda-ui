import React from 'react';
import { FilterSelect } from 'common';
import { describe, it, jest } from '@jest/globals';
import { mount } from 'enzyme';

const options = [
  {
    value: 1,
    text: 'DEV',
  },
  {
    value: 2,
    text: 'TEST',
  },
  {
    value: 3,
    text: 'STAGING',
  },
  {
    value: 4,
    text: 'PROD',
  },
];

describe('FileSelect', () => {
  it('render with empty options', () => {
    const initFetchFn = jest.fn();
    const wrapper = mount(
      <FilterSelect
        multiple
        value={[1, 2]}
        options={[]}
        fetching
        initFetch={initFetchFn}
      />,
    );
    expect(initFetchFn).toHaveBeenCalled();
    expect(wrapper.find('Select').at(0).prop('notFoundContent')).toBeTruthy();
    wrapper.setProps({
      fetching: false,
    });
    expect(wrapper.find('Select').at(0).prop('notFoundContent')).toBeNull();
  });
  it('render with options', () => {
    const wrapper = mount(
      <FilterSelect
        multiple={false}
        value={options[0].value}
        options={options}
        fetching
      />,
    );
    wrapper.find('Select').at(0).prop('onSearch')(options[1].text);
    expect(wrapper.state().filteredList).toHaveLength(1);
    wrapper.find('Select').at(0).prop('onSearch')('');
    expect(wrapper.state().filteredList).toHaveLength(0);
  });
});

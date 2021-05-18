import React from 'react';
import { DropdownSelect } from 'common';
import { describe, it } from '@jest/globals';
import { mount } from 'enzyme';

const menuList = [{
  name: 'DEV',
  key: 'dev',
},
{
  name: 'TEST',
  key: 'test',
},
{
  name: 'STAGING',
  key: 'staging',
},
{
  name: 'PROD',
  key: 'prod',
  children: [
    {
      name: 'PROD-1',
      key: 'prod-1',
    },
    {
      name: 'PROD-2',
      key: 'prod-2',
    },
  ],
}];

describe('DropdownSelect', () => {
  it('should render well', () => {
    const wrapper = mount(
      <DropdownSelect
        menuList={menuList}
      />
    );
    const Dropdown = wrapper.find('Dropdown').at(0);
    const overlay = mount(
      Dropdown.prop('overlay')
    );
    expect(overlay.find('MenuItem')).toHaveLength(6);
    expect(overlay.find('SubMenu')).toHaveLength(2);
  });
});

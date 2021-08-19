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

import React from 'react';
import { mount } from 'enzyme';
import { ContractiveFilter } from 'common';

const genderMap = [
  {
    name: 'male',
    id: 'male',
  },
  {
    name: 'female',
    id: 'female',
  },
];

const conditionsFilter = [
  {
    key: 'name',
    type: 'input',
    label: 'NAME',
    customProps: {},
  },
  {
    key: 'gender',
    type: 'select',
    label: 'GENDER',
    options: genderMap.map((item) => ({ label: item.name, value: item.id, icon: '' })),
    customProps: {},
  },
  {
    key: 'birthday',
    type: 'dateRange',
    label: 'BIRTHDAY',
    customProps: {},
  },
];

// processing
describe('ContrastiveFilter', () => {
  it('ContrastiveFilter should work well', () => {
    document.body.innerHTML = '<div id="main" style="height: 400px; overflow-y: auto"></div>';
    const event = new Event('click', { bubbles: true, cancelable: false });
    const changeFn = jest.fn();
    const divEle = document.getElementById('main');
    const wrapper = mount(<ContractiveFilter delay={500} conditions={conditionsFilter} onChange={changeFn} />, {
      attachTo: divEle,
    });
    expect(wrapper.find('.contractive-filter-bar')).toExist();
    wrapper.find('.contractive-filter-item-wrap').at(1).simulate('click');
    divEle?.dispatchEvent(event);
    wrapper.unmount();
  });
});

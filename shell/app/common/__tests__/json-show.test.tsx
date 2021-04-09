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

/* eslint-disable no-undef */
import * as React from 'react';
import { JsonShow } from 'common';

const json = {
  a: {
    b: 'hello',
  },
};
describe('JsonShow', () => {
  it('render with data', () => {
    const wrapper = shallow(<JsonShow data={null} />);
    expect(wrapper.find('pre')).toHaveText('');
    expect(wrapper.children().find('span').at(0)).toHaveText('JSON');

    wrapper.setProps({ data: json, name: 'test' });
    expect(wrapper.find('pre')).toHaveText(JSON.stringify(json, null, 2));
    expect(wrapper.children().find('span').at(0)).toHaveText('test');
  });

  it('toggle visible by click button or switch', () => {
    const wrapper = mount(<JsonShow data={json} />);

    // const detailDom = wrapper.find('.json-detail');
    expect(wrapper.find('.json-detail')).not.toHaveClassName('slide-in');
    wrapper.find('.ant-switch').first().simulate('click');
    expect(wrapper.find('.json-detail')).toHaveClassName('slide-in');

    wrapper.find('.json-detail-btn').last().simulate('click');
    expect(wrapper.find('.json-detail')).not.toHaveClassName('slide-in');
  });
});

describe('JsonShow Snapshot', () => {
  test('renders', () => {
    const component = renderer.create(
      <JsonShow data={json} />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

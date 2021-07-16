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
import { mount, shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';
import { ErdaIcon, ErdaCustomIcon } from 'common';

describe('erda-icon', () => {
  describe('ErdaIcon', () => {
    it('render with iconType', () => {
      const fn = jest.fn();
      const wrapper = mount(<ErdaIcon iconType="lock" className="customize-cls" onClick={fn} />);
      expect(wrapper.find('.i-icon').hasClass('customize-cls')).toBeTruthy();
      wrapper.find('.i-icon').simulate('click');
      expect(fn).toHaveBeenCalled();
    });
    it('render with illegal icon Type', () => {
      const wrapper = mount(<ErdaIcon iconType="illegal" />);
      expect(wrapper).toHaveHTML('<span>Not Exists</span>');
    });
  });
  describe('ErdaCustomIcon', () => {
    it('ErdaCustomIcon should render well', () => {
      const wrapper = shallow(
        <ErdaCustomIcon className="custom-icon" type="edit" color="primary" fill="lightgray" stroke="shallow-gray" />,
      );

      expect(wrapper.find('iconpark-icon').props()).toStrictEqual({
        class: 'custom-icon',
        name: 'edit',
        color: 'rgb(106,84,158)',
        fill: 'rgb(187,187,187)',
        stroke: 'rgb(187,187,187)',
      });
      wrapper.setProps({
        opacity: 0.1,
      });
      expect(wrapper.find('iconpark-icon').props()).toStrictEqual({
        class: 'custom-icon',
        name: 'edit',
        color: 'rgba(106,84,158,0.1)',
        fill: 'rgba(187,187,187,0.1)',
        stroke: 'rgba(187,187,187,0.1)',
      });
    });
  });
});

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
import { TagsColumn } from 'common';
import { IProps } from 'common/components/tags-column';
import { shallow } from 'enzyme';
import { describe, it } from '@jest/globals';

const labels: IProps['labels'] = [
  { label: 'green label;green label', color: 'green' },
  { label: 'red label;red label', color: 'red' },
  { label: 'orange label;orange label', color: 'orange' },
  { label: 'purple label;purple label', color: 'purple' },
  { label: 'blue label;blue label', color: 'blue' },
  { label: 'cyan label;cyan label', color: 'cyan' },
  { label: 'gray label;gray label', color: 'gray' },
];
describe('TagsColumn', () => {
  it('should render with default props', () => {
    const wrapper = shallow(<TagsColumn labels={labels} />);
    expect(wrapper.find('.tags-box').children('TagItem')).toHaveLength(2);
    expect(wrapper.find('TagItem').at(0).prop('size')).toBe('small');
    expect(wrapper.find('.tags-box').children().last().children().text()).toContain('...');
    expect(wrapper.find('Tooltip')).toExist();
    // @ts-ignore
    expect(React.Children.count(wrapper.find('Tooltip').prop('title').props.children)).toBe(labels.length);
  });
  it('should render with customize props', () => {
    const wrapper = shallow(
      <TagsColumn labels={labels} showCount={labels.length} size="default" containerClassName="containerClassName" />,
    );
    expect(wrapper).toHaveClassName('containerClassName');
    expect(wrapper.find('.tags-box').children('TagItem')).toHaveLength(labels.length);
    expect(wrapper.find('TagItem').at(0).prop('size')).toBe('default');
    expect(wrapper.find('Tooltip')).not.toExist();
  });
});

// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { TagsColumn, IProps } from '../components/tags-column';
import { shallow } from 'enzyme';
import { describe, it } from '@jest/globals';


const labels:IProps['labels'] = [
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
    const wrapper = shallow(
      <TagsColumn
        labels={labels}
      />
    );
    expect(wrapper.find('.tags-box').children('span.tag-default')).toHaveLength(3);
    expect(wrapper.find('span.tag-default')).toHaveClassName('small');
    expect(wrapper.children().last().text()).toContain('...');
    expect(wrapper.find('Tooltip')).toExist();
    // @ts-ignore
    expect(React.Children.count(wrapper.find('Tooltip').prop('title').props.children)).toBe(labels.length);
  });
  it('should render with customize props', () => {
    const wrapper = shallow(
      <TagsColumn
        labels={labels}
        showCount={labels.length}
        size="default"
        containerClassName="containerClassName"
      />
    );
    expect(wrapper).toHaveClassName('containerClassName');
    expect(wrapper.find('.tags-box').children('span.tag-default')).toHaveLength(labels.length);
    expect(wrapper.find('span.tag-default')).toHaveClassName('default');
    expect(wrapper.find('Tooltip')).not.toExist();
  });
});
